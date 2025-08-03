import { Router } from "express";
import tenantController from "../controllers/tenant.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRole.middleware.js";

const router = Router();

/**
 * @route POST /api/v1/tenants
 * @desc Create a new tenant (Admin only)
 */
router.post("/", verifyJWT, authorizeRoles("admin"), tenantController.createTenant);

/**
 * @route GET /api/v1/tenants
 * @desc Get all tenants (Admin only)
 */
router.get("/", verifyJWT, authorizeRoles("admin"), tenantController.getAllTenants);

/**
 * @route GET /api/v1/tenants/:slug
 * @desc Get tenant by slug (any logged-in user)
 */
router.get("/:slug", verifyJWT, tenantController.getTenantBySlug);

export default router;
