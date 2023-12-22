//importing user model
import User from "../../../models/User.js";
//importing user model
import Song from "../../../models/Song.js";
//importing artist model
import Artist from "../../../models/Artist.js"
//importing album model
import Album from "../../../models/Album.js"

//importing validator
import validator from "validator";
//importing jwt
import jwt from "jsonwebtoken";

//importing bcrypt
import bcrypt from "bcrypt";

// importing path and filesystem
import Path from "path";
import fileSystem from "fs";

// importing logger middleware function
import { log } from "../../../config/logger_middleware.js";

// importing config methods
import { deleteFileCloud, generatePresignedUrl } from "../../../config/gcs_config.js";
const salt = 10;

const jwtSecret = process.env.JWT_SECRET || "secretkey";




//to create new user
const create = async (req, res) => {

    try {
        const { name, email, password, confirm_password } = req.body;

        if (!name)
            return res.status(401).json({ message: "Please provide a valid name" });

        if (password.length < 5)
            return res.status(401).json({ message: "Passwords must be 5 characters or more" });

        //if passwords does not match
        if (password !== confirm_password)
            return res.status(401).json({ message: "Passwords does not match" });

        //if email is invalid
        if (!validator.isEmail(email))
            return res.status(401).json({ message: "Provide a valid email" });

        const user = await User.findOne({ email: email });
        //is user already present
        if (user)
            return res.status(409).json({ message: "User already exists!" });

        //creating new user
        const encryptedPass = await bcrypt.hash(String(password), salt);
        const newUser = await User.create({ name, email, password: encryptedPass });
        //if user created successfully
        if (newUser) return res.status(201).json({ message: "User created successfully" });

        return res.status(400).json({ message: "Unable to signup!" });

    } catch (error) {
        log(`URL: ${req.url} ${error}`, "error.txt");
        return res.status(500).json({ message: "Internal Server Error" });
    }

}


const createSession = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        //if the email or password does not match
        if (!user) return res.status(401).json({ message: "Invalid Email/Password" });

        const isAuthentic = await bcrypt.compare(String(password), user.password);
        if (!isAuthentic) return res.status(401).json({ message: "Invalid Email/Password" });

        return res.status(200).json({
            message: "Login successful",
            token: jwt.sign(user.toJSON(), jwtSecret, { expiresIn: 1000000 }),
            name: user.name
        });

    } catch (error) {
        log(`URL: ${req.url} ${error}`, "error.txt");
        return res.status(500).json({ message: "Internal server error" });
    }

};

//to authenticate the user
const authenticate = (req, res) => {
    return res.status(200).json({
        name: req.user.name,
        message: "Authentication successful"
    });
}

//to update the user details
const update = async (req, res) => {
    try {
        const { name, email, password, new_password, confirm_password } = req.body;
        //IF USER WANTS TO UPDATE ITS OWN DETAILS
        if (!req.params.id) {

            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: "User not found" });

            if (new_password && !confirm_password) return res.status(400).json({ message: "please confirm your new password" });
            if (new_password != confirm_password) return res.status(400).json({ message: "Password mismatch!" });
            //updating user's password
            if (new_password) {
                const encryptedPass = await bcrypt.hash(new_password, salt);
                await user.updateOne({ password: encryptedPass });
            }
            //updating other details
            await user.updateOne({ name, email });
            await user.save();
            return res.status(202).json({ message: "User details updated successfully" });

        }

        //IF WANT TO UPDATE SOMEONE ELSE'S DETAILS

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found!" });

        //If password is not provided
        if (!password) return res.status(401).json({ message: "Unauthorized! provide your password to authenticate " });
        //authenticating user
        const isAuthentic = await bcrypt.compare(String(password), user.password);
        if (!isAuthentic) return res.status(403).json({ message: "Forbidden! incorrect password" });

        if (new_password && !confirm_password) return res.status(400).json({ message: "please confirm your new password" });
        if (new_password != confirm_password) return res.status(400).json({ message: "Password mismatch!" });
        //updating user's password
        if (new_password) {
            const encryptedPass = await bcrypt.hash(new_password, salt);
            await user.updateOne({ password: encryptedPass });
        }

        //updating other details
        await user.updateOne({ name, email });
        await user.save();
        return res.status(202).json({ message: "User details updated successfully" });

    } catch (error) {
        log(`URL: ${req.url} ${error}`, "error.txt");
        return res.status(500).json({ message: "Internal server error" });

    }
}



//to delete a user
const destroy = async (req, res) => {
    try {
        if (!req.body.password) return res.status(401).json({ message: "Unauthorized! Provide password to establish identity" });

        const user = await User.findById(req.user._id);
        //if user not found
        if (!user) return res.status(404).json({ message: "User not found!" });

        //to authenticate the user before deleting
        const isAuthentic = await bcrypt.compare(String(req.body.password), user.password);
        if (!isAuthentic) return res.status(401).json({ message: "Unauthorized!" });

        //deleting songs associated to that user
        for (let song of user.uploadedSongs) await deleteSongs(song);

        const token = jwt.sign(user.toJSON(), jwtSecret, { expiresIn: 1 });
        await user.deleteOne();
        return res.status(204).json({ message: "User deleted Successfully", token });

    } catch (error) {
        log(`URL: ${req.url} ${error}`, "error.txt");
        return res.status(500).json({ message: "Internal server error" });

    }

}

//function to delete the songs
const deleteSongs = async (id) => {
    try {
        const song = await Song.findById(id);
        if (!song) return;
        // to delete the file from bucket
        await deleteFileCloud(song.path, song.coverArt);
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
    } catch (error) {
        log(`URL: ${req.url} ${error}`, "error.txt");
        return;

    }
}

//to get all the songs uploaded by the user
const uploads = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        //if user not found
        if (!user) return res.status(404).json({ message: "User not found" });

        //if there are no songs uploaded by the user
        if (user.uploadedSongs.length == 0) return res.status(404).json({ message: "No songs were uploaded" });

        let songs = await Song.find({ _id: { $in: user.uploadedSongs } }).populate("artist", "name")
            .select("title artist album duration path coverArt uploadedBy");

        songs = await Promise.all(songs.map(async (song) => {
            const songSignedUrl = await generatePresignedUrl(song.path);
            const coverSignedUrl = await generatePresignedUrl(song.coverArt);
            song.path = songSignedUrl[0];
            song.coverArt = coverSignedUrl[0];
            return song;
        }));


        return res.status(200).json({ message: "Songs uploaded by the user fetched successfully", data: songs });
    } catch (error) {
        log(`URL: ${req.url} ${error}`, "error.txt");
        return res.status(500).json({ message: "Internal server error" });
    }


}


const controllers = { create, createSession, authenticate, update, destroy, uploads };
// exporting controllers
export default controllers;
