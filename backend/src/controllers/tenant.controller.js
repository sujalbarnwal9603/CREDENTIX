import asyncHandler from "../utils/asyncHandler.js";
import { Tenant } from "../models/Tenant.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const createTenant =asyncHandler(async(req,res)=>{
    const {name, slug}=req.body;

    if(!name?.trim() || !slug?.trim()){
        throw new ApiError(400,"Name and slug are required");
    }

    const tenantExist = await Tenant.findOne({
        $or: [{name},{slug:slug.toLowerCase()}],
    });

    if(tenantExist){
        throw new ApiError(400,"Tenant with this name or slug already exists");
    }

    const tenant = await Tenant.create({
        name,
        slug: slug.toLowerCase(),
        createdBy: req.user?._id || null,
    })

    return res
        .status(201)
        .json(new ApiResponse(201, tenant, "Tenant created successfully"))
})

const getAllTenants =asyncHandler(async(req,res)=>{
    const tenants = await Tenant.find().populate("createdBy", "fullName email")

    return res
        .status(200)
        .json(new ApiResponse(200, tenants, "Tenants fetched successfully"));
})

const getTenantBySlug = asyncHandler(async(req,res)=>{
    const {slug} =req.params;

    const tenant =await Tenant.findOne({slug:slug.toLowerCase()});

    if(!tenant){
        throw new ApiError(404, "Tenant not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tenant, "Tenant fetched successfully"));

})


export default {
    createTenant,
    getAllTenants,
    getTenantBySlug
}