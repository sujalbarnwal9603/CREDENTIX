import express from "express";
const router=express.Router();

/**
 * @route GET /.well-known/openid-configuration
 * @desc Provides OpenId Connect Discovery metadata
 */

router.get("/.well-known/openid-configuration", (req,res)=>{
    const host=`${req.protocol}://${req.get("host")}`;  

    return res.json({
        issuer:host,
        authorization_endpoint:`${host}/api/v1/oauth2/authorize`,
        token_endpoint:`${host}/api/v1/oauth2/token`,
        userinfo_endpoint:`${host}/api/v1/oauth2/userinfo`,
        registration_endpoint:`${host}/api/v1/oauth2/register-client`,

        // Optional
        jwks_uri:`${host}/.well-known/jwks.json`, // (if you later add public key sharing)


        // Supported capabilities
        response_types_supported:["code"],
        grant_types_supported:["authorization_code", "refresh_token"],
        subject_types_supported:["public"],
        id_token_signing_alg_values_supported:["RS256"],
        token_endpoint_auth_methods_supported:["client_secret_post"],

        // Optional
        scopes_supported:["openid","email", "profile"],
        claims_supported:["sub", "email", "email_verified", "name"],
    });
});

export default router;