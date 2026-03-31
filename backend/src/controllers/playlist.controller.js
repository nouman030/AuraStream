import PlaylistServices from "../services/playlist.service.js";
import MusicServices from "../services/music.service.js";


const createPlaylist = async (req, res) => {
    try {
        const { name, description, visibility } = req.body;
        const user = req.user.id; // strictly force creator to be the logged in user
        const playlist = await PlaylistServices.createPlaylist({ user, name, description, visibility });
        res.status(201).json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllPlaylists = async (req, res) => {
    try {
        const playlists = await PlaylistServices.getAllPublicPlaylists();
        res.status(200).json({ success: true, playlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getUserPlaylists = async (req, res) => {
    try {
        const playlists = await PlaylistServices.getUserPlaylists(req.user.id);
        res.status(200).json({ success: true, playlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await PlaylistServices.getPlaylistById(id);
        
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found." });
        
        // If unlisted or private, must be owner or admin to see
        if (playlist.visibility === "private" && playlist.user._id.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "This playlist is private." });
        }

        res.status(200).json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const playlistCheck = await PlaylistServices.getPlaylistById(id);
        if (!playlistCheck) return res.status(404).json({ success: false, message: "Playlist not found." });
        if (playlistCheck.user._id.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized. You cannot modify a playlist you do not own." });
        }

        const playlist = await PlaylistServices.updatePlaylist(id, req.body);
        res.status(200).json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const playlistCheck = await PlaylistServices.getPlaylistById(id);
        if (!playlistCheck) return res.status(404).json({ success: false, message: "Playlist not found." });
        if (playlistCheck.user._id.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized. You cannot delete a playlist you do not own." });
        }

        const playlist = await PlaylistServices.deletePlaylist(id);
        res.status(200).json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const addSongToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { musicId } = req.body;

        const playlistCheck = await PlaylistServices.getPlaylistById(id);
        if (!playlistCheck) return res.status(404).json({ success: false, message: "Playlist not found." });
        if (playlistCheck.user._id.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized. You can only inject songs into your own playlists." });
        }

        const musicCheck = await MusicServices.getMusicById(musicId);
        if (!musicCheck) return res.status(404).json({ success: false, message: "Music track not found. You can only add existing music." });
        
        const playlist = await PlaylistServices.addSongToPlaylist(id, musicId);
        res.status(200).json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const removeSongFromPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { musicId } = req.body;

        const playlistCheck = await PlaylistServices.getPlaylistById(id);
        if (!playlistCheck) return res.status(404).json({ success: false, message: "Playlist not found." });
        if (playlistCheck.user._id.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized. You can only remove songs from your own playlists." });
        }

        const playlist = await PlaylistServices.removeSongFromPlaylist(id, musicId);
        res.status(200).json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { createPlaylist, getAllPlaylists, getUserPlaylists, getPlaylistById, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist };
