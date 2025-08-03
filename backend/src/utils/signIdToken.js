import fs from "fs"
import path from "path"
import { SignJWT } from "jose"
import { importPKCS8 } from "jose"

const privateKeyPath = path.resolve("src/keys/private.pem")
const privateKeyPEM = fs.readFileSync(privateKeyPath, "utf8")

// ID Token signing algorithm and metadata
const ALG = "RS256"

export const signIdToken = async (user, client_id) => {
  const privateKey = await importPKCS8(privateKeyPEM, ALG)
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = 60 * 15 // 15 minutes

  const jwt = await new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    name: user.fullName,
    tenant: user.tenant,
    role: user.role,
    iss: process.env.ISSUER || "http://localhost:8000",
    aud: client_id,
  })
    .setProtectedHeader({ alg: ALG, typ: "JWT", kid: "credentix-key-1" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .setIssuer(process.env.ISSUER || "http://localhost:8000")
    .setAudience(client_id)
    .sign(privateKey)

  return jwt
}
