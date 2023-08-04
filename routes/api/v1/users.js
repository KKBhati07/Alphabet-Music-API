//importing express
import express from "express";
const router = express.Router();

import { authenticateToken } from "../../../config/jwt_middleware.js";

//importing user controller
import userApiController from "../../../controllers/api/v1/users_api.js";

//to create user
router.post("/create", userApiController.create);

//to create session
router.post("/create-session", userApiController.createSession);

//to authenticate
router.get("/authenticate", authenticateToken, userApiController.authenticate);

//to delete a user
router.delete("/destroy", authenticateToken, userApiController.destroy);

//to update other users user's details
router.patch("/update/:id", authenticateToken, userApiController.update);

//to update user details
router.patch("/update", authenticateToken, userApiController.update);


//exporting router
export default router;