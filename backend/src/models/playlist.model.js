import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "public"
    },
    musics: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Music"
        }
    ]
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);