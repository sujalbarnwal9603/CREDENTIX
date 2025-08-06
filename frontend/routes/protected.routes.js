import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Corrected import path

const router = express.Router();

// Define protected routes here
router.get("/profile", verifyJWT, (req, res) => {
  res.send("Profile page");
});

export default router;
