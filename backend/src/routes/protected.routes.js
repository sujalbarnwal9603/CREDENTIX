import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

// Example protected route
router.get("/dashboard", verifyJWT, (req, res) => {
  res.json({
    success: true,
    message: `Welcome ${req.user.fullName}, your role is ${req.user.role}`,
    user: req.user,
  });
});

export default router;
