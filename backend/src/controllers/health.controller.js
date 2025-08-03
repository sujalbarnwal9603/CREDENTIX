import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import redis from "../config/redis.js"

/**
 * @desc Basic health check
 * @route GET /health
 * @access Public
 */
const healthCheck = asyncHandler(async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  }

  return res.status(200).json(new ApiResponse(200, health, "Service is healthy"))
})

/**
 * @desc Detailed health check with dependencies
 * @route GET /health/detailed
 * @access Public
 */
const detailedHealthCheck = asyncHandler(async (req, res) => {
  const checks = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    dependencies: {
      database: "OK",
      redis: "OK",
    },
  }

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState !== 1) {
      checks.dependencies.database = "ERROR"
      checks.status = "ERROR"
    }
  } catch (error) {
    checks.dependencies.database = "ERROR"
    checks.status = "ERROR"
  }

  // Check Redis connection
  try {
    await redis.ping()
  } catch (error) {
    checks.dependencies.redis = "ERROR"
    checks.status = "ERROR"
  }

  const statusCode = checks.status === "OK" ? 200 : 503

  return res
    .status(statusCode)
    .json(
      new ApiResponse(statusCode, checks, checks.status === "OK" ? "All systems operational" : "Some systems are down"),
    )
})

export default {
  healthCheck,
  detailedHealthCheck,
}
