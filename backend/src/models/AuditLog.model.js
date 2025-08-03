import mongoose, { Schema } from "mongoose"

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Some actions might not have a user (system actions)
    },
    action: {
      type: String,
      required: true,
      enum: [
        "USER_REGISTER",
        "USER_LOGIN",
        "USER_LOGOUT",
        "USER_EMAIL_VERIFY",
        "USER_PASSWORD_RESET",
        "CLIENT_REGISTER",
        "CLIENT_DELETE",
        "OAUTH_AUTHORIZE",
        "OAUTH_TOKEN_EXCHANGE",
        "TENANT_CREATE",
        "TENANT_UPDATE",
        "ROLE_CREATE",
        "ROLE_UPDATE",
        "ADMIN_ACTION",
      ],
    },
    resource: {
      type: String,
      required: false, // What was acted upon (user ID, client ID, etc.)
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Additional details about the action
      default: {},
    },
    ip_address: {
      type: String,
      required: false,
    },
    user_agent: {
      type: String,
      required: false,
    },
    success: {
      type: Boolean,
      default: true,
    },
    error_message: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
)

// Index for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 })
auditLogSchema.index({ action: 1, createdAt: -1 })
auditLogSchema.index({ createdAt: -1 })

export const AuditLog = mongoose.model("AuditLog", auditLogSchema)
