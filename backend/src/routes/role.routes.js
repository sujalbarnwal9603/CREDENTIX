import { Router } from "express";
import roleController from "../controllers/role.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRole.middleware.js";

const router= Router();

router.post("/", verifyJWT, authorizeRoles("admin"), roleController.createRole);

router.get("/", verifyJWT, authorizeRoles("admin"), roleController.getAllRoles);

router.put("/:roleId", verifyJWT, authorizeRoles("admin"), roleController.updateRolePermissions);

export default router;