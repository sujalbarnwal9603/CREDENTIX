import { Router } from "express"
import adminController from "../controllers/admin.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import authorizeRoles from "../middlewares/authorizeRole.middleware.js"

const router = Router()

// All admin routes require authentication and admin role
router.use(verifyJWT, authorizeRoles("admin"))

// Dashboard stats
router.get("/stats", adminController.getDashboardStats)

// User management
router.get("/users", adminController.getAllUsersAdmin)
router.patch("/users/:userId/status", adminController.updateUserStatus)
router.delete("/users/:userId", adminController.deleteUser)

// Client management
router.get("/clients", adminController.getAllClientsAdmin)
router.delete("/clients/:clientId", adminController.deleteClient)

// Audit logs
router.get("/audit-logs", adminController.getAuditLogs)

export default router
