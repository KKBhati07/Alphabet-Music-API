//importing express
import express from "express";
const router = express.Router();

//importing home controller
import homeController from "../controllers/home_controller.js";


import api from "./api/index.js";
router.use("/api", api);

//to render homepage
router.get("/home", homeController.home);

router.use(homeController.toHome);


//exporting router
export default router;