//importing mongoose
import mongoose from "mongoose";

//creating schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    uploadedSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
    }]
    //to keep track of entry and update time
}, { timestamps: true });

//exporting model as default
export default mongoose.model("User", userSchema);