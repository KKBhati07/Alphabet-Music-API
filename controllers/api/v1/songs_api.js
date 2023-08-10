//importing important modules
import Song from "../../../models/Song.js";
import User from "../../../models/User.js";
import * as mm from "music-metadata";
import fs from "fs/promises";
import Path from "path";
import fileSystem from "fs";
import validator from "validator";


const COVER_PATH = Path.resolve("uploads/covers");
const SONG_PATH = Path.resolve("uploads/songs");


const uploadFile = async (req, res) => {
  try {
    //checking if the user exists
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found", logout: true });

    if (!req.file) return res.status(404).json({ message: "No file uploaded" });

    const { filename, path } = req.file;
    const allowed = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg",];

    //to check a file is valid or not
    if (!validator.isIn(req.file.mimetype, allowed)) {
      fileSystem.unlinkSync(path);
      return res.status(400).json({ message: "Provide a valid file" });
    }




    // extracting song metadata
    const metadata = await mm.parseFile(path);

    // Extract the relevant metadata fields from the parsed metadata
    const { title, artist, album, picture } = metadata.common;
    const {duration}=metadata.format;

    const songTitle = req.body.title || title;
    const artistName = req.body.artist || artist;
    const albumName = req.body.album || album;

    //id not title is provided to the song
    if (!songTitle) {
      fileSystem.unlinkSync(path);
      return res.status(400).json({ message: "Provide a valid Name" });
    }

    let coverPath = null;
    //TO EXTRACT COVER ART FROM METADATA AND SAVE IN DATABASE
    if (Array.isArray(picture) && picture.length > 0) {
      const coverArtData = picture[0].data;

      // to generate a unique filename for the cover image
      const coverFilename = `cover-${Date.now() + "-" + Math.round(Math.random() * 1E9)}`;

      const coverPathOnDisk = Path.join(COVER_PATH, coverFilename);
      await fs.writeFile(coverPathOnDisk, coverArtData);
      coverPath = `/${coverFilename}`;
    }

    const song = await Song.create({
      title: songTitle,
      artist: artistName,
      album: albumName,
      duration:duration,
      path: `/${filename}`,
      uploadedBy: req.user._id,
      coverArt: coverPath
    });

    //if the song is not uploaded and saved
    if (!song) return res.status(400).json({ message: "Unable to upload song" });


    //adding song to user
    user.uploadedSongs.push(song);
    await user.save();
    //if the song upload successfully

    return res.status(200).json({
      message: "Song uploaded successfully",
    });

    //is something goes wrong
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

//to fetch all the songs from the server
const fetchSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    return res.status(200).json({ message: "Songs Fetched successfully", data: songs });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });

  }
}



const destroy = async (req, res) => {
  try {

    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    //id the delete request is not made by the uploader
    if (song.uploadedBy != req.user._id)
      return res.status(403).json({ message: "Not authorized to delete the song" });


    //deleting the song and cover art associated to it
    const songPath = Path.join(SONG_PATH, song.path.replace("/", ""));
    const coverArtPath = Path.join(COVER_PATH, song.coverArt.replace("/", ""));
    fileSystem.unlinkSync(songPath);
    fileSystem.unlinkSync(coverArtPath);

    //deleting song from uploaded songs array
    await User.findByIdAndUpdate(song.uploadedBy, { $pull: { uploadedSongs: song._id } });

    // Delete the song from database
    await song.deleteOne();
    return res.status(200).json({ message: "Song deleted successfully!", deleted: { id: song._id, title: song.title, } });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });

  }
}

const controllers = { uploadFile, fetchSongs, destroy };
//exporting controllers
export default controllers;

