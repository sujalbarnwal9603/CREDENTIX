import { Router } from "express"
import oauthController from "../controllers/oauth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate, validateQuery, schemas } from "../middlewares/validation.middleware.js"
import { oauthLimiter } from "../middlewares/rateLimiter.middleware.js"

const router = Router()

// Apply OAuth rate limiting
router.use(oauthLimiter)

// ✅ OAuth2 endpoints - authorize needs authentication, others are public
router.get("/authorize", validateQuery(schemas.oauthAuthorize), verifyJWT, oauthController.handleAuthorize)

// ✅ PUBLIC OAuth endpoints
router.post("/token", validate(schemas.oauthToken), oauthController.handleToken)
router.get("/userinfo", oauthController.handleUserInfo)
router.post("/introspect", oauthController.handleIntrospect)

export default router
