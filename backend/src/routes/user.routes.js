import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRole.middleware.js";

const router = Router();

// GET /api/v1/users/me → get current user's profile
router.get("/me", verifyJWT, userController.getProfile);

// GET /api/v1/users → admin fetches all users
router.get("/", verifyJWT, authorizeRoles("admin"), userController.getAllUsers);

// GET /api/v1/users/:userId → admin fetches specific user
router.get("/:userId", verifyJWT, authorizeRoles("admin"), userController.getSingleUser);

export default router;
