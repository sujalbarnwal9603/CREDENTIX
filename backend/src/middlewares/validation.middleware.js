import Joi from "joi"
import ApiError from "../utils/ApiError.js"

// Validation schemas
export const schemas = {
  register: Joi.object({
    fullName: Joi.string().min(2).max(50).required().messages({
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name cannot exceed 50 characters",
      "any.required": "Full name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
    tenantSlug: Joi.string()
      .pattern(/^[a-zA-Z0-9-_]+$/) // ✅ Allow hyphens and underscores
      .min(2)
      .max(30)
      .required()
      .messages({
        "string.pattern.base": "Tenant slug can only contain letters, numbers, hyphens, and underscores",
      }),
    roleName: Joi.string().valid("admin", "user", "editor").required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createTenant: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    slug: Joi.string()
      .pattern(/^[a-zA-Z0-9-_]+$/)
      .min(2)
      .max(30)
      .required(),
  }),

  registerClient: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    redirect_uris: Joi.array().items(Joi.string().uri()).min(1).required(),
  }),

  oauthAuthorize: Joi.object({
    response_type: Joi.string().valid("code").required(),
    client_id: Joi.string().required(),
    redirect_uri: Joi.string().uri().required(),
    scope: Joi.string().optional(),
    state: Joi.string().optional(),
  }),

  oauthToken: Joi.object({
    grant_type: Joi.string().valid("authorization_code", "refresh_token").required(),
    code: Joi.string().when("grant_type", {
      is: "authorization_code",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    refresh_token: Joi.string().when("grant_type", {
      is: "refresh_token",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    client_id: Joi.string().required(),
    client_secret: Joi.string().required(),
    redirect_uri: Joi.string().uri().when("grant_type", {
      is: "authorization_code",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "New password is required",
      }),
  }),
}

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      throw new ApiError(400, "Validation failed", errors)
    }

    next()
  }
}

// Query validation for GET requests
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      throw new ApiError(400, "Query validation failed", errors)
    }

    next()
  }
}
