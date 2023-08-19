//importing express
import express from "express";
const router=express.Router();

//importing controller
import artistController from "../../../controllers/api/v1/artists_api.js";

//to fetch songs by artist
router.get("/:id/songs",artistController.fetchSongs);

//to fetch all the artists
router.get("/fetch",artistController.fetch);

//to search the artists
router.get("/search",artistController.search);

//if the user hitting paths, other then  specified endpoints
import {resourceNotFound} from "../../../controllers/404_controller.js";
router.use(resourceNotFound);


//exporting router
export default router;