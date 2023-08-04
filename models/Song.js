//importing mongoose
import mongoose from "mongoose";

//creating song schema
const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
    },
    album: {
        type: String,
    },
    duration: {
        type: String,
    },
    path: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    coverArt: {
        type: String
    }
}, { timestamps: true });




const Song = mongoose.model("Song", songSchema);
//exporting song model
export default Song;