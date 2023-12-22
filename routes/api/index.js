//importing express
import express from "express";
const router = express.Router();


import v1 from "./v1/index.js";
router.use("/v1", v1);


//if the user hitting paths, other then  specified endpoints
import {invalidRequest} from "../../controllers/invalid_request_controller.js";
router.use(invalidRequest);

//exporting router
export default router;