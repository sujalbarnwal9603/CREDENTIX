import nodemailer from "nodemailer"
import crypto from "crypto"
import { EmailVerification } from "../models/EmailVerification.model.js"
import logger from "../utils/logger.js"

// Create transporter only if SMTP is configured
let transporter = null

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
} else {
  logger.warn("SMTP not configured - email functionality will be disabled")
}

/**
 * Generate and send email verification token
 */
export const sendVerificationEmail = async (user) => {
  try {
    if (!transporter) {
      logger.warn("Email not sent - SMTP not configured")
      return
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex")

    // Save token to database
    await EmailVerification.create({
      user: user._id,
      token,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`

    // Email template
    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@credentix.com",
      to: user.email,
      subject: "Verify Your Email - Credentix",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Welcome to Credentix!</h2>
          <p>Hi ${user.fullName},</p>
          <p>Thank you for registering with Credentix. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    logger.info(`✅ Verification email sent to ${user.email}`)
  } catch (error) {
    logger.error("❌ Error sending verification email:", error)
    // Don't throw error - just log it
  }
}

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    if (!transporter) {
      logger.warn("Password reset email not sent - SMTP not configured")
      return
    }

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@credentix.com",
      to: user.email,
      subject: "Password Reset - Credentix",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hi ${user.fullName},</p>
          <p>You requested a password reset for your Credentix account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    logger.info(`✅ Password reset email sent to ${user.email}`)
  } catch (error) {
    logger.error("❌ Error sending password reset email:", error)
    // Don't throw error - just log it
  }
}
