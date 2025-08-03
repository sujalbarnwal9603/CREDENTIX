import logger from "../utils/logger.js"
import { v4 as uuidv4 } from "uuid"

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = uuidv4()

  // Log request
  logger.http(`[${req.requestId}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    requestId: req.requestId,
  })

  // Log response
  const originalSend = res.send
  res.send = function (data) {
    logger.http(`[${req.requestId}] Response: ${res.statusCode}`, {
      statusCode: res.statusCode,
      requestId: req.requestId,
    })
    originalSend.call(this, data)
  }

  next()
}

/**
 * Error logging middleware
 */
export const errorLogger = (err, req, res, next) => {
  logger.error(`[${req.requestId || "unknown"}] ${err.message}`, {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  })

  next(err)
}
