import { Client } from "../models/Client.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import crypto from "crypto"

/**
 * @desc Register a new OAuth2 client
 * @route POST /api/v1/oauth2/register-client
 * @access Private (logged-in developer or admin)
 */
const registerClient = asyncHandler(async (req, res) => {
  const { name, redirect_uris } = req.body

  // Validate required fields
  if (!name || !redirect_uris || !Array.isArray(redirect_uris)) {
    throw new ApiError(400, "Name and redirect_uris (array) are required")
  }

  // Generate unique client_id and secret
  const client_id = crypto.randomBytes(16).toString("hex")
  const client_secret = crypto.randomBytes(32).toString("hex")

  // Create client record in DB
  const client = await Client.create({
    name,
    client_id,
    client_secret,
    redirect_uris,
    createdBy: req.user._id,
  })

  // Return response with generated credentials
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        client_id: client.client_id,
        client_secret: client.client_secret,
        redirect_uris: client.redirect_uris,
        name: client.name,
      },
      "OAuth2 Client registered successfully",
    ),
  )
})

export default {
  registerClient,
}
