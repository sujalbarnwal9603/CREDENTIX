import mongoose, { Schema } from "mongoose"

const emailVerificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
  },
  { timestamps: true },
)

export const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema)
