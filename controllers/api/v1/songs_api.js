//importing important modules
import os from "os";
import Song from "../../../models/Song.js";
import User from "../../../models/User.js";
import Artist from "../../../models/Artist.js";
import Album from "../../../models/Album.js";
import * as mm from "music-metadata";
import fs from "fs";
import Path from "path";
import validator from "validator";
import { log } from "../../../config/logger_middleware.js";
import { uploadFileCloud,deleteFileCloud,generatePresignedUrl } from "../../../config/gcs_config.js";


//to upload a file/song
const uploadFile = async (req, res) => {
  try {
    //checking if the user exists
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found", logout: true });

    if (!req.file) return res.status(404).json({ message: "No file uploaded" });

    // const { filename, path } = req.file;
    const allowed = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg",];

    //to check a file is valid or not
    if (!validator.isIn(req.file.mimetype, allowed)) {
      // await fs.promises.unlink(path);
      return res.status(400).json({ message: "Provide a valid file" });
    }

    const tempFilePath = Path.join(os.tmpdir(), 'temp-file');
    await fs.promises.writeFile(tempFilePath, req.file.buffer);
    const metadata = await mm.parseFile(tempFilePath);

    // Extract the relevant metadata fields from the parsed metadata
    const { title, artist, album, picture } = metadata.common;
    const { duration } = metadata.format;


    const songTitle = req.body.title || title;
    const artistName = req.body.artist || artist || "Unknown";
    const albumName = req.body.album || album || "Unknown";

    //id not title is provided to the song
    if (!songTitle) {
      await fs.promises.unlink(tempFilePath);
      return res.status(400).json({ message: "Provide a valid Name" });
    }

    //checking if the song is already uploaded
      const isUploaded = await Song.findOne({ title: songTitle });
      if (isUploaded) {
        return res.status(400).json({ message: "Song already Exists" });
      }


      //finding, if the artist already exists
      let fetchArtist = await Artist.findOne({ name: artistName });
      //if not, then creating the artist
    if (!fetchArtist) fetchArtist = await Artist.create({ name: artistName });

    
    //finding, if the album already exists
    let fetchAlbum = await Album.findOne({ name: albumName });
    //if not, then creating the artist
    if (!fetchAlbum) fetchAlbum = await Album.create({ name: albumName });

    const songCloudObject=  await uploadFileCloud(tempFilePath,`songs/${generateUniqueName("song")}`);

    let coverPath = null;
    let coverArtCloudObject;
    //TO EXTRACT COVER ART FROM METADATA AND SAVE IN DATABASE
    if (Array.isArray(picture) && picture.length > 0) {
      const coverArtData = picture[0].data;
      const tempCoverPath = Path.join(os.tmpdir(), 'temp-cover');
    await fs.promises.writeFile(tempCoverPath, coverArtData);
      coverArtCloudObject=await uploadFileCloud(tempCoverPath,`cover/${generateUniqueName("cover")}`);
      await fs.promises.unlink(tempCoverPath);
    }

    await fs.promises.unlink(tempFilePath);
    
    
    const song = await Song.create({
      title: songTitle,
      artist: fetchArtist._id,
      album: fetchAlbum._id,
      duration: duration,
      path: songCloudObject.obj[0].name,
      uploadedBy: req.user._id,
      coverArt: coverArtCloudObject.obj[0].name
    });

    //if the song is not uploaded and saved
    if (!song) return res.status(400).json({ message: "Unable to upload song" });


    //adding song to user
    user.uploadedSongs.push(song);
    await user.save();

    //adding song to artist
    fetchArtist.songs.push(song);
    await fetchArtist.save();

    //adding song to albums
    fetchAlbum.songs.push(song);
    await fetchAlbum.save();

    //if the song upload successfully
    return res.status(201).json({
      message: "Song uploaded successfully",
    });

    //is something goes wrong
  } catch (error) {
    log(`URL: ${req.url} ${error}`, "error.txt");
    return res.status(500).json({ message: "Internal server error" });
  }
}

function generateUniqueName(type){
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    return type + "-" + uniqueSuffix;
}

//to fetch all the songs from the server
const fetchSongs = async (req, res) => {
  try {
    let songs = await Song.find().populate("artist", "name").populate("uploadedBy", "name").populate("album", "name")
      .select("title artist album duration path coverArt uploadedBy");
      songs = await Promise.all(songs.map(async (song) => {
        const songSignedUrl = await generatePresignedUrl(song.path);
        const coverSignedUrl = await generatePresignedUrl(song.coverArt);
        song.path = songSignedUrl[0];
        song.coverArt = coverSignedUrl[0];
        return song;
      }));
  
    return res.status(200).json({ message: "Songs Fetched successfully", data: songs });

  } catch (error) {
    log(`URL: ${req.url} ${error}`, "error.txt");
    return res.status(500).json({ message: "Internal Server Error" });

  }
}


//to delete a song from the database
const destroy = async (req, res) => {
  try {

    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    //id the delete request is not made by the uploader
    if (song.uploadedBy != req.user._id)
      return res.status(401).json({ message: "Not authorized to delete the song" });

    if(!await deleteFileCloud(song.path,song.coverArt)) return res.status(400).json({message:"Unable to delete songs"});

    //deleting song from uploaded songs array
    await User.findByIdAndUpdate(song.uploadedBy, { $pull: { uploadedSongs: song._id } });
    //deleting song from artist's songs array
    await Artist.findByIdAndUpdate(song.artist, { $pull: { songs: song._id } });

    const updatedArtist = await Artist.findById(song.artist);

    //if there are no songs with the artist, then deleting the artist
    if (updatedArtist.songs.length == 0) await updatedArtist.deleteOne();

    //deleting song from albums's songs array
    await Album.findByIdAndUpdate(song.album, { $pull: { songs: song._id } });

    const updatedAlbum = await Album.findById(song.album);

    //if there are no songs with the album, then deleting the album
    if (updatedAlbum.songs.length == 0) await updatedAlbum.deleteOne();




    // Delete the song from database
    await song.deleteOne();
    return res.status(200).json({ message: "Song deleted successfully!", deleted: { id: song._id, title: song.title, } });

  } catch (error) {
    log(`URL: ${req.url} ${error}`, "error.txt");
    return res.status(500).json({ message: "Internal server error" });

  }
}

//to search uploaded songs
const search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Invalid search" });
    let songs = await Song.find({ title: { $regex: query, $options: "i" } }).populate("artist", "name")
      .populate("uploadedBy", "name")
      .select("title artist album duration path coverArt uploadedBy");
      songs = await Promise.all(songs.map(async (song) => {
        const songSignedUrl = await generatePresignedUrl(song.path);
        const coverSignedUrl = await generatePresignedUrl(song.coverArt);
        song.path = songSignedUrl[0];
        song.coverArt = coverSignedUrl[0];
        return song;
      }));

    return res.status(200).json({ message: "Songs fetched", data: songs });

  } catch (error) {
    log(`URL: ${req.url} ${error}`, "error.txt");
    return res.status(500).json({ message: "Internal server error" });
  }
}

const controllers = { uploadFile, fetchSongs, destroy, search };
//exporting controllers
export default controllers;