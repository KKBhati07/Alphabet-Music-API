//importing express
import express from "express";
const router = express.Router();

//for users Api
import userApi from "./users.js";
router.use("/users", userApi);


//for artists Api
import artistApi from "./artists.js";
router.use("/artists", artistApi);


//for albums Api
import albumsApi from "./albums.js";
router.use("/albums", albumsApi);

import songApi from "./songs.js";
//routing request to songs router
router.use("/songs", songApi);

//if the user hitting paths, other then  specified endpoints
import {resourceNotFound} from "../../../controllers/404_controller.js";
router.use(resourceNotFound);

//exporting router
export default router;