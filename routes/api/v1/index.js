//importing express
import express from "express";
const router = express.Router();


import userApi from "./users.js";
router.use("/users", userApi);

import songApi from "./songs.js";
//routing request to songs router
router.use("/songs", songApi);

//exporting router
export default router;