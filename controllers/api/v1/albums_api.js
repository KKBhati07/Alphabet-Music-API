//importing models
import Album from "../../../models/Album.js";
import Song from "../../../models/Song.js";


//to fetch all the albums
const fetch = async (req, res) => {
    try {
        const albums = await Album.find().select("name songs");
        //if album not found
        if (!albums) return res.status(404).json({ message: "Albums not found" });

        return res.status(200).json({message:"Albums fetched successfully", data:albums});
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });

    }
}



//ti fetch the song by album id
const fetchSongs = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);

        //if album not found
        if (!album) return res.status(404).json({ message: "Album not found" });
        
        //if there are no songs 
        if (album.songs.length == 0) return res.status(404).json({ message: "No songs were uploaded" });
        
        //fetching songs 
        const songs = await Song.find({ _id: { $in: album.songs } })
            .select("title artist album duration path coverArt uploadedBy").populate("artist","name")
            .populate("uploadedBy","name").populate("album","name");

        return res.status(200).json({message:"Songs fetched successfully", data:songs});
 
        
    } catch (error) {

        return res.status(500).json({ message: "Internal server error" });
        
        
    }

}

//to search albums
const search=async(req,res)=>{
    try {
        const {query} = req.query;
        if (!query) return res.status(401).json({ message: "Invalid search" });
        const albums=await Album.find({name:{$regex:query,$options:"i"}}).select("name songs");
        
        return res.status(200).json({ message: "Albums Fetched", data: albums});
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

//exporting controllers
export default { fetchSongs,fetch,search };