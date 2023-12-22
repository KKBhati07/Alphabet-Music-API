import upload from "../../../config/multer.js";

//importing express
import express from "express";
const router = express.Router();

import { authenticateToken } from "../../../config/jwt_middleware.js";

//importing controllers
import songsApiController from "../../../controllers/api/v1/songs_api.js";

//to upload a song
router.post("/upload", authenticateToken, upload.single("song"), songsApiController.uploadFile);

//to fetch songs
router.get("/fetch", songsApiController.fetchSongs);

//to search songs
router.get("/search", songsApiController.search);

//to delete a song from server
router.delete("/destroy/:id", authenticateToken, songsApiController.destroy);

//if the user hitting paths, other then  specified endpoints
import {invalidRequest} from "../../../controllers/invalid_request_controller.js";
router.use(invalidRequest);


//exporting router
export default router;