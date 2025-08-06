import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import jwt from 'jsonwebtoken';
import ApiResponse from "../utils/ApiResponse.js";
import redisClient from "../utils/redis.client.js"; // Corrected import path for redis client
import { generateAuthorizationCode } from "../utils/oauth2.utils.js";
import { AuthorizationCode } from "../models/AuthorizationCode.model.js";

// Removed in-memory store as Redis is used

/*** @desc Handle OAuth2 authorization request (returns auth code)
 * @route GET /oauth2/authorize
 * @access Logged-in User
 */
/*** @desc Handles the /authorize endpoint of the OAuth2 flow
 * @route GET /oauth2/authorize*/
const handleAuthorize = async (req, res) => {
    try {
        const { response_type, client_id, redirect_uri, scope, state } = req.query;
        // ✅ Validating required parameters
        if (!response_type || !client_id || !redirect_uri) {
            return res.status(400).json({ error: "Missing required query parameters" });
        }
        // ✅ Validating response_type
        if (response_type !== "code") {
            return res.status(400).json({ error: "Unsupported response_type" });
        }
        // ✅ Fetch client from DB
        const client = await Client.findOne({ client_id });
        if (!client) {
            return res.status(400).json({ error: "Invalid client_id" });
        }
        if (!client.redirect_uris.includes(redirect_uri)) {
            return res.status(400).json({ error: "Invalid redirect_uri" });
        }
        // ✅ User must be authenticated at this point
        const user = req.user;
        if (!user) {
            // User not logged in
            return res.status(401).json({ error: "User not authenticated" });
        }
        // ✅ Generate unique authorization code
        const code = generateAuthorizationCode();
        // ✅ Store the authorization code in DB (optional fallback) and Redis (fast)
        await AuthorizationCode.create({
            code,
            client_id,
            user_id: user._id,
            redirect_uri,
            scope,
            expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        });
        // ✅ Also store code in Redis with expiry (5 minutes)
        await redisClient.setEx(`auth_code:${code}`, 300, JSON.stringify({
            client_id,
            user_id: user._id.toString(),
            redirect_uri,
            scope,
        }));
        // ✅ Redirect with the authorization code
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.set("code", code);
        if (state) redirectUrl.searchParams.set("state", state);
        return res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error("❌ Error in handleAuthorize:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/*** @desc Exchange auth code for access & refresh tokens
 * @route POST /oauth2/token
 * @access Public*/
const handleToken = asyncHandler(async (req, res) => {
    const { code, client_id, client_secret, redirect_uri, grant_type } = req.body; // Fixed typo: redirecct_uri -> redirect_uri
    if (!code || !client_id || !client_secret || !redirect_uri || !grant_type) {
        throw new ApiError(400, "Missing required body parameters"); // More specific error message
    }
    if (grant_type !== "authorization_code") {
        throw new ApiError(400, "Only 'authorization_code' grant_type supported");
    }
    // ✅ Validate client_id and secret
    const client = await Client.findOne({ client_id });
    if (!client) {
        throw new ApiError(400, "Invalid client_id");
    }
    if (client.client_secret !== client_secret) {
        throw new ApiError(400, "Invalid client_secret");
    }
    if (!client.redirect_uris.includes(redirect_uri)) {
        throw new ApiError(400, "Invalid redirect_uri");
    }
    const rawData = await redisClient.get(`auth_code:${code}`); // Using redisClient
    if (!rawData) {
        throw new ApiError(400, "Invalid or expired code");
    }
    const authData = JSON.parse(rawData);
    // One-time use: delete it
    await redisClient.del(`auth_code:${code}`); // Using redisClient
    if (!authData || authData.client_id !== client_id) {
        throw new ApiError(400, "Invalid or expired code");
    }
    const user = await User.findById(authData.user_id); // Fixed: authData.userId -> authData.user_id
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // ✅ Consume the code (one-time use) - already done by redis.del
    const id_token = await signIdToken(user, client_id);
    return res.status(200).json(new ApiResponse(200, {
        access_token: accessToken,
        refresh_token: refreshToken,
        id_token, // ✅ Add ID token
        token_type: "Bearer",
        expires_in: 15 * 60,
    }, "Tokens generated successfully"));
});

/*** @desc Return user info based on access token
 * @route GET /oauth2/userinfo
 * @access Public (with Bearer token)*/
const handleUserInfo = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new ApiError(401, "Access token is required");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, {
        sub: user._id,
        email: user.email,
        fullName: user.fullName,
        tenant: user.tenant,
        role: user.role
    }, "User info fetched successfully"));
});

/*** @desc Token Introspection (RFC 7662)
 * @route POST /oauth2/introspect
 * @access Public (used by resource servers)*/
const handleIntrospect = asyncHandler(async (req, res) => {
    const { token, token_type_hint } = req.body;
    if (!token) {
        throw new ApiError(400, "Token is required");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("-password -refreshToken")
        if (!user) {
            return res.status(200).json({ active: false })
        }
        return res.status(200).json({
            active: true,
            sub: user._id,
            username: user.email,
            tenant: user.tenant,
            role: user.role,
            exp: decoded.exp,
            iat: decoded.iat,
            scope: decoded.scope || "user",
        });
    } catch (err) {
        return res.status(200).json({ active: false })
    }
})
export default {
    handleAuthorize,
    handleToken,
    handleUserInfo,
    handleIntrospect
}
