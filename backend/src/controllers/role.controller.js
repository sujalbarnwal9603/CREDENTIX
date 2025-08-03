import asyncHandler from "../utils/asyncHandler.js";
import {Role} from "../models/Role.model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";


const createRole = asyncHandler(async(req,res)=>{
    const {name, permissions=[]} =req.body;

    if(!name?.trim()){
        throw new ApiError(400, "Role name is required");
    }

    const roleExist = await Role.findOne({name});

    if(roleExist){
        throw new ApiError(400, "Role already exists");
    }

    const role =await Role.create({name, permissions});

    return res
        .status(201)
        .json(new ApiResponse(201, role, "Role created successfully"));
})

const getAllRoles= asyncHandler(async(req,res)=>{
    const roles=await Role.find();

    return res
        .status(200)
        .json(new ApiResponse(200, roles, "Roles fetched successfully"));
})

const updateRolePermissions =asyncHandler(async(req,res)=>{
    const {roleId} =req.params;
    const {permissions} =req.body;

    const role =await Role.findById(roleId);

    if(!role){
        throw new ApiError(404, "Role not found");
    }

    role.permissions=permissions;
    await role.save();

    return res
        .status(200)
        .json(new ApiResponse(200, role, "Role permissions updated successfully"));

})

export default {
    createRole,
    getAllRoles,
    updateRolePermissions
}
