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

//to delete a song from server
router.delete("/destroy/:id", authenticateToken, songsApiController.destroy);


//exporting router
export default router;