import express from "express";
import fs from "fs";
import path from "path";
import { importSPKI, exportJWK } from "jose"; // ✅ Added exportJWK
import { webcrypto } from "node:crypto";

// ✅ Fix crypto reference for Node.js < 20
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const router = express.Router();

/**
 * @route GET /.well-known/jwks.json
 * @desc Returns JSON Web Key Set (JWKS) for public key discovery
 */
router.get("/.well-known/jwks.json", async (req, res) => {
  try {
    const publicKeyPath = path.resolve("src/keys/public.pem");
    const publicKeyPem = fs.readFileSync(publicKeyPath, "utf8");

    // Step 1: Convert PEM to CryptoKey
    const cryptoKey = await importSPKI(publicKeyPem, "RS256");

    // ✅ Step 2: Convert to JWK
    const publicJwk = await exportJWK(cryptoKey);

    // Add metadata required by clients
    publicJwk.use = "sig";
    publicJwk.kid = "credentix-key-1";
    publicJwk.alg = "RS256";

    return res.json({
      keys: [publicJwk],
    });
  } catch (error) {
    console.error("❌ Error generating JWKS:", error);
    res.status(500).json({ error: "Failed to generate JWKS" });
  }
});

export default router;
