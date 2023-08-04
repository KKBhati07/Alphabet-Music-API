// importing multer
import multer from "multer";

import path from "path";
//declaring the path
const SONG_PATH = path.resolve("uploads/songs");



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(SONG_PATH));
  },
  filename: function (req, file, cb) {

    //to give a unique name to each song
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });
//exporting upload
export default upload;
