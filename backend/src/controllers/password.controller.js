import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"
import { PasswordReset } from "../models/PasswordReset.model.js"
import { sendPasswordResetEmail } from "../services/email.service.js"
import crypto from "crypto"

/**
 * @desc Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })

  if (!user) {
    // Don't reveal if user exists or not for security
    return res
      .status(200)
      .json(new ApiResponse(200, null, "If an account with that email exists, a password reset link has been sent"))
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex")

  // Delete any existing reset tokens for this user
  await PasswordReset.deleteMany({ user: user._id })

  // Create new reset token
  await PasswordReset.create({
    user: user._id,
    token: resetToken,
    expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  })

  // Send reset email
  await sendPasswordResetEmail(user, resetToken)

  return res
    .status(200)
    .json(new ApiResponse(200, null, "If an account with that email exists, a password reset link has been sent"))
})

/**
 * @desc Reset password with token
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required")
  }

  // Find valid reset token
  const resetRecord = await PasswordReset.findOne({
    token,
    used: false,
    expires_at: { $gt: new Date() },
  }).populate("user")

  if (!resetRecord) {
    throw new ApiError(400, "Invalid or expired reset token")
  }

  // Update user password
  const user = resetRecord.user
  user.password = newPassword // Will be hashed by pre-save middleware
  await user.save()

  // Mark token as used
  resetRecord.used = true
  await resetRecord.save()

  // Invalidate all refresh tokens for security
  await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } })

  return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"))
})

/**
 * @desc Verify reset token validity
 * @route GET /api/v1/auth/verify-reset-token/:token
 * @access Public
 */
const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params

  const resetRecord = await PasswordReset.findOne({
    token,
    used: false,
    expires_at: { $gt: new Date() },
  })

  if (!resetRecord) {
    throw new ApiError(400, "Invalid or expired reset token")
  }

  return res.status(200).json(new ApiResponse(200, { valid: true }, "Token is valid"))
})

export default {
  forgotPassword,
  resetPassword,
  verifyResetToken,
}
