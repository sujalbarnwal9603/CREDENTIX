import { AuditLog } from "../models/AuditLog.model.js"
import logger from "../utils/logger.js"

/**
 * Log audit event to database and logger
 */
export const logAuditEvent = async ({
  user = null,
  action,
  resource = null,
  details = {},
  ip_address = null,
  user_agent = null,
  success = true,
  error_message = null,
}) => {
  try {
    await AuditLog.create({
      user,
      action,
      resource,
      details,
      ip_address,
      user_agent,
      success,
      error_message,
    })

    logger.info(`Audit: ${action} - ${success ? "SUCCESS" : "FAILED"}`, {
      user: user?.toString(),
      action,
      resource,
      success,
    })
  } catch (error) {
    logger.error("Failed to log audit event:", error)
  }
}

/**
 * Simple audit middleware that just logs events
 * (Database logging can be added later)
 */
export const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send

    res.send = function (data) {
      // Log the audit event after response is sent
      setImmediate(() => {
        logger.info(`Audit: ${action}`, {
          user: req.user?._id?.toString() || "anonymous",
          action,
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          success: res.statusCode < 400,
        })
      })

      originalSend.call(this, data)
    }

    next()
  }
}
