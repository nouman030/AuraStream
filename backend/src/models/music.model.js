import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    cloudinary_url: {
        type: String,
        required: true
    },
    cloudinary_id: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
});

export const Music = mongoose.model("Music", musicSchema);