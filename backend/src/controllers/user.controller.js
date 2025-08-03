import { User } from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const getProfile = asyncHandler(async(req,res)=>{
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User profile fetched successfully"));    
});

const getAllUsers= asyncHandler(async(req,res)=>{
    const users= await User.find()
        .select("-password -refreshToken")
        .populate("role", "name")
        .populate("tenant", "name sug")
    
    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
})



/**
 * @desc Get user by ID (Admin only)
 * @route GET /api/v1/users/:userId
 * @access Admin
 */

const getSingleUser=asyncHandler(async(req,res)=>{
    const {userId}= req.params;

    const user=await User.findById(userId)
        .select("-password -refreshToken")
        .populate("role", "name")
        .populate("tenant", "name sug");
    
    if(!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
})

export default{
    getProfile,
    getAllUsers,
    getSingleUser
}