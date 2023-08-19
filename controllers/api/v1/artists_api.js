//importing models
import Artist from "../../../models/Artist.js";
import Song from "../../../models/Song.js";


//to fetch all the artists
const fetch = async (req, res) => {
    try {
        const artists = await Artist.find().select("name songs");
        //if artist not found
        if (!artists) return res.status(404).json({ message: "Artist not found" });

        return res.status(200).json({message:"Artists fetched successfully", data:artists});
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });


    }
}



//ti fetch the song by artist id
const fetchSongs = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);

        //if artist not found
        if (!artist) return res.status(404).json({ message: "Artist not found" });
        
        //if there are no songs 
        if (artist.songs.length == 0) return res.status(404).json({ message: "No songs were uploaded" });
        
        //fetching songs 
        const songs = await Song.find({ _id: { $in: artist.songs } })
            .select("title artist album duration path coverArt uploadedBy").populate("artist","name")
            .populate("uploadedBy","name").populate("album","name");

        return res.status(200).json({message:"Songs fetched successfully", data:songs});
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
        
        
    }

}

//to search artists
const search=async(req,res)=>{
    try {
        const {query} = req.query;
        if (!query) return res.status(400).json({ message: "Invalid search" });
        const artists=await Artist.find({name:{$regex:query,$options:"i"}}).select("name songs");
        
        return res.status(200).json({ message: "Artists Fetched", data: artists});
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
        
    }
}


export default { fetchSongs,fetch,search };