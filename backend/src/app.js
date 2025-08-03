import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import helmet from "helmet"
import fs from "fs"

// Import middleware
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js"
import { requestLogger, errorLogger } from "./middlewares/logging.middleware.js"

const app = express()

// Create logs directory if it doesn't exist
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs")
}

// Security middleware
app.use(helmet())
app.use(morgan("dev"))

// Apply general rate limiting to all routes
app.use(generalLimiter)

// Request logging
app.use(requestLogger)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Health check routes (no rate limiting)
import healthRoutes from "./routes/health.routes.js"
app.use("/health", healthRoutes)

// API Documentation
import docsRoutes from "./routes/docs.routes.js"
app.use("/api/docs", docsRoutes)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🔥 Credentix AaaS API is Live!",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health",
    endpoints: {
      auth: "/api/v1/auth",
      oauth2: "/api/v1/oauth2",
      users: "/api/v1/users",
      admin: "/api/v1/admin",
      tenants: "/api/v1/tenants",
      roles: "/api/v1/roles",
    },
  })
})

// ========== API Routes ==========
import userRoutes from "./routes/user.routes.js"
import authRoutes from "./routes/auth.routes.js"
import roleRoutes from "./routes/role.routes.js"
import tenantRoutes from "./routes/tenant.routes.js"
import googleRoutes from "./routes/google.routes.js"
import oauthRoutes from "./routes/oauth.routes.js"
import clientRoutes from "./routes/client.routes.js"
import openidRoutes from "./routes/openid.routes.js"
import jwksRoutes from "./routes/jwks.routes.js"
import protectedRoutes from "./routes/protected.routes.js"
import adminRoutes from "./routes/admin.routes.js"

// Mount routes
app.use("/api/protected", protectedRoutes)
app.use("/api/v1/oauth", googleRoutes)
app.use("/api/v1/oauth2", clientRoutes)
app.use("/api/v1/oauth2", oauthRoutes)
app.use("/", openidRoutes)
app.use("/", jwksRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/roles", roleRoutes)
app.use("/api/v1/tenants", tenantRoutes)
app.use("/api/v1/admin", adminRoutes)

// ========== 404 Handler ==========
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
    availableEndpoints: "/api/docs",
  })
})

// ========== Error Logging Middleware ==========
app.use(errorLogger)

// ========== Global Error Handler ==========
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    requestId: req.requestId,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

export default app
