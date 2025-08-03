import crypto from "crypto"

/**
 * Generate a secure authorization code
 * @returns {string} - Random authorization code
 */
export const generateAuthorizationCode = () => {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Generate a secure state parameter
 * @returns {string} - Random state parameter
 */
export const generateState = () => {
  return crypto.randomBytes(16).toString("hex")
}
