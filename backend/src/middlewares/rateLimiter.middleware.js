import rateLimit from "express-rate-limit"
import RedisStore from "rate-limit-redis"
import redis from "../config/redis.js"

// General API rate limiter
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:general:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:auth:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // TEMPORARILY INCREASED SIGNIFICANTLY for debugging
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
})

// OAuth endpoints rate limiter
export const oauthLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:oauth:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    success: false,
    message: "Too many OAuth requests, please try again later.",
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
})
