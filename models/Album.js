//importing mongoose
import mongoose from 'mongoose';

//creating schema
const albumSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    songs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Song"
    }]

},{timestamps:true});

//exporting model
export default mongoose.model("Album",albumSchema);