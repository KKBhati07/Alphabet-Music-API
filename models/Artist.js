//importing mongoose
import mongoose from 'mongoose';

//creating artist schema
const ArtistSchema = new mongoose.Schema({
    name:{
        type: 'string',
        required: true
    },
    songs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Song"
    }]
},{timestamps:true});

//exporting model
export default mongoose.model("Artist",ArtistSchema);
