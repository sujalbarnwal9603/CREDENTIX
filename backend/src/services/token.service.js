import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

// ✅ Generate Access Token
export const generateAccessToken = (user) => {
  try {
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      tenant: user.tenant,
    };

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m', // ⏱️ access token expires in 15 minutes
    });
  } catch (error) {
    throw new ApiError(500, "Failed to generate access token");
  }
};

// ✅ Generate Refresh Token
export const generateRefreshToken = (user) => {
  try {
    const payload = {
      _id: user._id,
    };

    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d', // 🔁 refresh token expires in 7 days
    });
  } catch (error) {
    throw new ApiError(500, "Failed to generate refresh token");
  }
};
