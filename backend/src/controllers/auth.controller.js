import { User } from "../models/User.model.js";
import { Role } from "../models/Role.model.js";
import { Tenant } from "../models/Tenant.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// ✅ Centralized token generation functions
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";

// ✅ Centralized helper for access and refresh token generation
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, tenantSlug, roleName } = req.body;

  if ([fullName, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const userExist = await User.findOne({ $or: [{ email }] });
  if (userExist) {
    throw new ApiError(400, "User already exists");
  }

  const tenant = await Tenant.findOne({ slug: tenantSlug });
  if (!tenant) {
    throw new ApiError(400, "Tenant does not exist");
  }

  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new ApiError(400, "Role does not exist");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    tenant: tenant._id,
    role: role._id,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) {
    throw new ApiError(500, "User Registration Failed. Try again!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, userCreated, "User Registration Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const userExist = await User.findOne({ email });
  if (!userExist) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordCorrect = await userExist.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(userExist._id);

  const loggedInUser = await User.findById(userExist._id)
    .select("-password -refreshToken")
    .populate("role tenant");

  if (!loggedInUser) {
    throw new ApiError(500, "Login Failed. Try again!!!");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Login Successful"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: null } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Logout Successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    let decodedToken;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const user = await User.findById(decodedToken?._id);
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// ✅ Export all auth controller methods
export default {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
};