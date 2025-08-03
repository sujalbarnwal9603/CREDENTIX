import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

const router = express.Router();

// 1. Initiate Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// 2. Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    const user = req.user;

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Google login successful",
      accessToken,
      refreshToken,
      user: {
        fullName: user.fullName,
        email: user.email,
        tenant: user.tenant,
        role: user.role,
      },
    });
  }
);

export default router;
