import mongoose, { Schema } from "mongoose"

const authorizationCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    client_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    redirect_uri: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      default: "openid email profile",
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired codes
    },
  },
  { timestamps: true },
)

export const AuthorizationCode = mongoose.model("AuthorizationCode", authorizationCodeSchema)
