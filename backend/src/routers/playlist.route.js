import { Router } from "express";
import { 
    createPlaylist, 
    getAllPlaylists, 
    getUserPlaylists, 
    getPlaylistById, 
    updatePlaylist, 
    deletePlaylist, 
    addSongToPlaylist, 
    removeSongFromPlaylist 
} from "../controllers/playlist.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Retrieve playlists
router.get("/all-playlists", getAllPlaylists); // Only fetches public playlists
router.get("/my-playlists", verifyToken, getUserPlaylists);
router.get("/playlist/:id", verifyToken, getPlaylistById);

// Manage base playlist records
router.post("/create", verifyToken, createPlaylist);
router.put("/playlist/:id", verifyToken, updatePlaylist);
router.delete("/playlist/:id", verifyToken, deletePlaylist);

// Modify playlist songs
router.post("/playlist/:id/add-song", verifyToken, addSongToPlaylist);
router.delete("/playlist/:id/remove-song", verifyToken, removeSongFromPlaylist);

export default router;
