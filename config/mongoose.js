//importing mongoose
import mongoose from "mongoose";

//declaring the mongo uri
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:/alphabet_music_api";
//establishing connection
mongoose.connect(mongoUri);
export const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connection to DB"));
db.once("open", () => {
    console.log("Connected to database :: MongoDB");
});

//exporting database
export default db;