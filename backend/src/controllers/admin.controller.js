import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"
import { Client } from "../models/Client.model.js"
import { AuditLog } from "../models/AuditLog.model.js"
import { Tenant } from "../models/Tenant.model.js"
import { Role } from "../models/Role.model.js"
import { logAuditEvent } from "../services/audit.service.js"

/**
 * @desc Get dashboard statistics
 * @route GET /api/v1/admin/stats
 * @access Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [userCount, clientCount, tenantCount, roleCount, recentLogins] = await Promise.all([
    User.countDocuments(),
    Client.countDocuments(),
    Tenant.countDocuments(),
    Role.countDocuments(),
    AuditLog.countDocuments({
      action: "USER_LOGIN",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    }),
  ])

  const stats = {
    users: {
      total: userCount,
      verified: await User.countDocuments({ isVerified: true }),
      active: await User.countDocuments({ status: "active" }),
    },
    clients: {
      total: clientCount,
    },
    tenants: {
      total: tenantCount,
    },
    roles: {
      total: roleCount,
    },
    activity: {
      recentLogins,
      totalAuditLogs: await AuditLog.countDocuments(),
    },
  }

  return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"))
})

/**
 * @desc Get all users with pagination and filters
 * @route GET /api/v1/admin/users
 * @access Admin
 */
const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "", isVerified = "", tenant = "", role = "" } = req.query

  // Build filter object
  const filter = {}

  if (search) {
    filter.$or = [{ fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
  }

  if (status) filter.status = status
  if (isVerified !== "") filter.isVerified = isVerified === "true"
  if (tenant) filter.tenant = tenant
  if (role) filter.role = role

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken")
      .populate("role", "name")
      .populate("tenant", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit)),
    User.countDocuments(filter),
  ])

  const pagination = {
    current: Number.parseInt(page),
    pages: Math.ceil(total / Number.parseInt(limit)),
    total,
    hasNext: skip + users.length < total,
    hasPrev: Number.parseInt(page) > 1,
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination,
      },
      "Users fetched successfully",
    ),
  )
})

/**
 * @desc Update user status (activate/suspend)
 * @route PATCH /api/v1/admin/users/:userId/status
 * @access Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { status } = req.body

  if (!["active", "suspended"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'active' or 'suspended'")
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const oldStatus = user.status
  user.status = status
  await user.save()

  // Log audit event
  await logAuditEvent({
    user: req.user._id,
    action: "ADMIN_ACTION",
    resource: userId,
    details: {
      action: "UPDATE_USER_STATUS",
      oldStatus,
      newStatus: status,
    },
    ip_address: req.ip,
    user_agent: req.get("User-Agent"),
  })

  return res.status(200).json(new ApiResponse(200, user, `User ${status} successfully`))
})

/**
 * @desc Delete user (soft delete)
 * @route DELETE /api/v1/admin/users/:userId
 * @access Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  // Soft delete by updating status
  user.status = "suspended"
  user.email = `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
  await user.save()

  // Log audit event
  await logAuditEvent({
    user: req.user._id,
    action: "ADMIN_ACTION",
    resource: userId,
    details: {
      action: "DELETE_USER",
      deletedUser: {
        email: user.email,
        fullName: user.fullName,
      },
    },
    ip_address: req.ip,
    user_agent: req.get("User-Agent"),
  })

  return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"))
})

/**
 * @desc Get all clients with pagination
 * @route GET /api/v1/admin/clients
 * @access Admin
 */
const getAllClientsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query

  const filter = {}
  if (search) {
    filter.name = { $regex: search, $options: "i" }
  }

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit)),
    Client.countDocuments(filter),
  ])

  const pagination = {
    current: Number.parseInt(page),
    pages: Math.ceil(total / Number.parseInt(limit)),
    total,
    hasNext: skip + clients.length < total,
    hasPrev: Number.parseInt(page) > 1,
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clients,
        pagination,
      },
      "Clients fetched successfully",
    ),
  )
})

/**
 * @desc Delete client
 * @route DELETE /api/v1/admin/clients/:clientId
 * @access Admin
 */
const deleteClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params

  const client = await Client.findById(clientId)
  if (!client) {
    throw new ApiError(404, "Client not found")
  }

  await Client.findByIdAndDelete(clientId)

  // Log audit event
  await logAuditEvent({
    user: req.user._id,
    action: "CLIENT_DELETE",
    resource: client.client_id,
    details: {
      clientName: client.name,
      deletedBy: req.user.fullName,
    },
    ip_address: req.ip,
    user_agent: req.get("User-Agent"),
  })

  return res.status(200).json(new ApiResponse(200, null, "Client deleted successfully"))
})

/**
 * @desc Get audit logs with pagination and filters
 * @route GET /api/v1/admin/audit-logs
 * @access Admin
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action = "", user = "", success = "", startDate = "", endDate = "" } = req.query

  const filter = {}

  if (action) filter.action = action
  if (user) filter.user = user
  if (success !== "") filter.success = success === "true"

  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate) filter.createdAt.$lte = new Date(endDate)
  }

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit)),
    AuditLog.countDocuments(filter),
  ])

  const pagination = {
    current: Number.parseInt(page),
    pages: Math.ceil(total / Number.parseInt(limit)),
    total,
    hasNext: skip + logs.length < total,
    hasPrev: Number.parseInt(page) > 1,
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        logs,
        pagination,
      },
      "Audit logs fetched successfully",
    ),
  )
})

export default {
  getDashboardStats,
  getAllUsersAdmin,
  updateUserStatus,
  deleteUser,
  getAllClientsAdmin,
  deleteClient,
  getAuditLogs,
}
