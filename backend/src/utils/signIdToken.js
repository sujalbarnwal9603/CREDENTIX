import fs from 'fs';
import path from 'path';
import { SignJWT } from 'jose';
import { importPKCS8 } from 'jose';

const privateKeyPath = path.resolve('src/keys/private.pem');
const privateKeyPEM = fs.readFileSync(privateKeyPath, 'utf8');

// ID Token signing algorithm and metadata
const ALG = 'RS256'

export const signIdToken = async (userInfo, client_id) => { // Changed 'user' to 'userInfo'
    const privateKey = await importPKCS8(privateKeyPEM, ALG);
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 60 * 15; // 15 minutes

    const jwt = await new SignJWT({
        sub: userInfo._id.toString(), // Use userInfo
        email: userInfo.email,       // Use userInfo
        name: userInfo.fullName,     // Use userInfo
        tenant: userInfo.tenant,     // Use userInfo
        role: userInfo.role,         // Use userInfo
        iss: process.env.ISSUER || 'http://localhost:8000',
        aud: client_id,
    }).setProtectedHeader({ alg: ALG, typ: 'JWT', kid: 'credentix-key-1' })
        .setIssuedAt(now)
        .setExpirationTime(now + expiresIn)
        .setIssuer(process.env.ISSUER || 'http://localhost:8000')
        .setAudience(client_id)
        .sign(privateKey);

    return jwt;
}
