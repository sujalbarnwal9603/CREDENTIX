import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

  // Check if token is present
  if (!token) {
    throw new ApiError(401, "Access token missing")
  }

  // Verify token
  let decoded
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token")
  }

  // Fetch user and attach to request with populated role and tenant
  const user = await User.findById(decoded?._id)
    .select("-password -refreshToken")
    .populate("role", "name permissions")
    .populate("tenant", "name slug")

  if (!user) {
    throw new ApiError(401, "User not found or unauthorized")
  }

  req.user = user
  next()
})
