import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"
import { EmailVerification } from "../models/EmailVerification.model.js"
import { sendVerificationEmail } from "../services/email.service.js"

/**
 * @desc Verify email address
 * @route POST /api/v1/auth/verify-email
 * @access Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body

  if (!token) {
    throw new ApiError(400, "Verification token is required")
  }

  // Find verification record
  const verification = await EmailVerification.findOne({ token }).populate("user")

  if (!verification) {
    throw new ApiError(400, "Invalid or expired verification token")
  }

  // Update user verification status
  const user = verification.user
  user.isVerified = true
  await user.save()

  // Delete verification record
  await EmailVerification.deleteOne({ _id: verification._id })

  return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"))
})

/**
 * @desc Resend verification email
 * @route POST /api/v1/auth/resend-verification
 * @access Public
 */
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified")
  }

  // Delete existing verification tokens
  await EmailVerification.deleteMany({ user: user._id })

  // Send new verification email
  await sendVerificationEmail(user)

  return res.status(200).json(new ApiResponse(200, null, "Verification email sent successfully"))
})

export default {
  verifyEmail,
  resendVerification,
}
