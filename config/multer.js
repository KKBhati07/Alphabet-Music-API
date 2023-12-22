// importing multer
import multer from "multer";

import path from "path";
//declaring the path
const SONG_PATH = path.resolve("uploads/songs");


const storage=multer.memoryStorage();

const upload = multer({ storage: storage });
//exporting upload
export default upload;
