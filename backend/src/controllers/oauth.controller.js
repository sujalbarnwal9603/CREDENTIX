import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js"
import { Client } from "../models/Client.model.js"
import { signIdToken } from "../utils/signIdToken.js"
import redis from "../config/redis.js" // ✅ Fixed import path
import { generateAuthorizationCode } from "../utils/oauth2.utils.js"
import { AuthorizationCode } from "../models/AuthorizationCode.model.js"
import { generateAccessToken, generateRefreshToken } from "../services/token.service.js"

/**
 * @desc Handle OAuth2 authorization request (returns auth code)
 * @route GET /oauth2/authorize
 * @access Logged-in User
 */
const handleAuthorize = asyncHandler(async (req, res) => {
  const { response_type, client_id, redirect_uri, scope, state } = req.query

  // ✅ Validate required parameters
  if (!response_type || !client_id || !redirect_uri) {
    throw new ApiError(400, "Missing required query parameters")
  }

  // ✅ Validate response_type
  if (response_type !== "code") {
    throw new ApiError(400, "Unsupported response_type. Only 'code' is supported")
  }

  // ✅ Fetch and validate client
  const client = await Client.findOne({ client_id })
  if (!client) {
    throw new ApiError(400, "Invalid client_id")
  }

  if (!client.redirect_uris.includes(redirect_uri)) {
    throw new ApiError(400, "Invalid redirect_uri")
  }

  // ✅ User must be authenticated
  const user = req.user
  if (!user) {
    throw new ApiError(401, "User not authenticated")
  }

  // ✅ Generate authorization code
  const code = generateAuthorizationCode()

  try {
    // ✅ Store in database
    await AuthorizationCode.create({
      code,
      client_id,
      user_id: user._id,
      redirect_uri,
      scope: scope || "openid email profile",
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    })

    // ✅ Store in Redis for faster access
    await redis.setEx(
      `auth_code:${code}`,
      300,
      JSON.stringify({
        client_id,
        user_id: user._id.toString(),
        redirect_uri,
        scope: scope || "openid email profile",
      }),
    )

    // ✅ Redirect with authorization code
    const redirectUrl = new URL(redirect_uri)
    redirectUrl.searchParams.set("code", code)
    if (state) redirectUrl.searchParams.set("state", state)

    return res.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("❌ Error storing authorization code:", error)
    throw new ApiError(500, "Failed to generate authorization code")
  }
})

/**
 * @desc Exchange auth code for access & refresh tokens
 * @route POST /oauth2/token
 * @access Public
 */
const handleToken = asyncHandler(async (req, res) => {
  const { code, client_id, client_secret, redirect_uri, grant_type } = req.body // ✅ Fixed typo

  // ✅ Validate required fields
  if (!code || !client_id || !client_secret || !redirect_uri || !grant_type) {
    throw new ApiError(400, "Missing required parameters")
  }

  if (grant_type !== "authorization_code") {
    throw new ApiError(400, "Only 'authorization_code' grant_type is supported")
  }

  // ✅ Validate client credentials
  const client = await Client.findOne({ client_id })
  if (!client) {
    throw new ApiError(400, "Invalid client_id")
  }

  if (client.client_secret !== client_secret) {
    throw new ApiError(401, "Invalid client_secret")
  }

  if (!client.redirect_uris.includes(redirect_uri)) {
    throw new ApiError(400, "Invalid redirect_uri")
  }

  // ✅ Get authorization code data from Redis
  const rawData = await redis.get(`auth_code:${code}`)
  if (!rawData) {
    throw new ApiError(400, "Invalid or expired authorization code")
  }

  const authData = JSON.parse(rawData)

  // ✅ Validate code data
  if (authData.client_id !== client_id || authData.redirect_uri !== redirect_uri) {
    throw new ApiError(400, "Authorization code mismatch")
  }

  // ✅ Delete code (one-time use)
  await redis.del(`auth_code:${code}`)
  await AuthorizationCode.deleteOne({ code })

  // ✅ Get user and generate tokens
  const user = await User.findById(authData.user_id).populate("role tenant")
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)
  const id_token = await signIdToken(user, client_id)

  // ✅ Update user's refresh token
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token,
        token_type: "Bearer",
        expires_in: 15 * 60, // 15 minutes
        scope: authData.scope,
      },
      "Tokens generated successfully",
    ),
  )
})

/**
 * @desc Return user info based on access token
 * @route GET /oauth2/userinfo
 * @access Public (with Bearer token)
 */
const handleUserInfo = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Access token is required")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decoded._id)
      .select("-password -refreshToken")
      .populate("role", "name")
      .populate("tenant", "name slug")

    if (!user) {
      throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          sub: user._id,
          email: user.email,
          name: user.fullName,
          email_verified: user.isVerified,
          tenant: user.tenant?.name,
          role: user.role?.name,
        },
        "User info fetched successfully",
      ),
    )
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw new ApiError(401, "Invalid or expired access token")
    }
    throw error
  }
})

/**
 * @desc Token Introspection (RFC 7662)
 * @route POST /oauth2/introspect
 * @access Public (used by resource servers)
 */
const handleIntrospect = asyncHandler(async (req, res) => {
  const { token, token_type_hint } = req.body

  if (!token) {
    throw new ApiError(400, "Token is required")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decoded._id)
      .select("-password -refreshToken")
      .populate("role", "name")
      .populate("tenant", "name")

    if (!user) {
      return res.status(200).json({ active: false })
    }

    return res.status(200).json({
      active: true,
      sub: user._id,
      username: user.email,
      tenant: user.tenant?.name,
      role: user.role?.name,
      exp: decoded.exp,
      iat: decoded.iat,
      scope: decoded.scope || "openid email profile",
    })
  } catch (err) {
    return res.status(200).json({ active: false })
  }
})

export default {
  handleAuthorize,
  handleToken,
  handleUserInfo,
  handleIntrospect,
}
