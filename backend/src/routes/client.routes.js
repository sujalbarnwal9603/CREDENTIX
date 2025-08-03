import { Router } from "express";
import clientController from "../controllers/client.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router=Router();


/**
 * @route POST /api/v1/oauth2/register-client
 * @desc Register a new 3rd-party app
 * @access Private
 */

router.post("/register-client", verifyJWT, clientController.registerClient);

export default router;