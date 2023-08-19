//importing express
import express from "express";
const router=express.Router();

//importing controller
import albumsController from "../../../controllers/api/v1/albums_api.js";

//to fetch songs by albums
router.get("/:id/songs",albumsController.fetchSongs);

//to fetch all the albums
router.get("/fetch",albumsController.fetch);

//to search the albums
router.get("/search",albumsController.search);

//if the user hitting paths, other then  specified endpoints
import {resourceNotFound} from "../../../controllers/404_controller.js";
router.use(resourceNotFound);


//exporting router
export default router;