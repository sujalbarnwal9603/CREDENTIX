import { Router } from "express"
import authController from "../controllers/auth.controller.js"
import emailController from "../controllers/email.controller.js"
import passwordController from "../controllers/password.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate, schemas } from "../middlewares/validation.middleware.js"
import { authLimiter } from "../middlewares/rateLimiter.middleware.js"
import { auditMiddleware } from "../services/audit.service.js"

const router = Router()

// Apply rate limiting to all auth routes
router.use(authLimiter)

// ✅ PUBLIC ROUTES (no authentication required)
router.post("/register", validate(schemas.register), auditMiddleware("USER_REGISTER"), authController.registerUser)
router.post("/login", validate(schemas.login), auditMiddleware("USER_LOGIN"), authController.loginUser)
router.post("/refresh", authController.refreshAccessToken)

// Email verification routes (public)
router.post("/verify-email", auditMiddleware("USER_EMAIL_VERIFY"), emailController.verifyEmail)
router.post("/resend-verification", emailController.resendVerification)

// Password reset routes (public)
router.post("/forgot-password", passwordController.forgotPassword)
router.post("/reset-password", auditMiddleware("USER_PASSWORD_RESET"), passwordController.resetPassword)
router.get("/verify-reset-token/:token", passwordController.verifyResetToken)

// ✅ PROTECTED ROUTES (authentication required)
router.post("/logout", verifyJWT, auditMiddleware("USER_LOGOUT"), authController.logoutUser)

export default router
