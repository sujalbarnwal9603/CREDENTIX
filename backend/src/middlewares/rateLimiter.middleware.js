import rateLimit from "express-rate-limit"
import RedisStore from "rate-limit-redis"
import redis from "../config/redis.js"

// General API rate limiter
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:general:", // Unique prefix for this limiter
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:auth:", // Unique prefix for this limiter
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// OAuth endpoints rate limiter
export const oauthLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:oauth:", // Unique prefix for this limiter
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 OAuth requests per windowMs
  message: {
    success: false,
    message: "Too many OAuth requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
