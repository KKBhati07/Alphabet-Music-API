//importing express
import express from "express";
const router = express.Router();


import v1 from "./v1/index.js";
router.use("/v1", v1);


//if the user hitting paths, other then  specified endpoints
import {resourceNotFound} from "../../controllers/404_controller.js";
router.use(resourceNotFound);

//exporting router
export default router;