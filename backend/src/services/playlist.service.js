import { Playlist } from "../models/playlist.model.js";

class PlaylistServices {
    async createPlaylist({ user, name, description, visibility, musics }) {
        const playlist = await Playlist.create({ user, name, description, visibility, musics });
        return playlist;
    }

    async getAllPublicPlaylists() {
        const playlists = await Playlist.find({ visibility: "public" })
            .populate("user", "username")
            .sort({ createdAt: -1 });
        return playlists;
    }
    
    async getUserPlaylists(userId) {
        const playlists = await Playlist.find({ user: userId })
            .populate("user", "username")
            .sort({ createdAt: -1 });
        return playlists;
    }

    async getPlaylistById(id) {
        const playlist = await Playlist.findById(id)
            .populate("user", "username")
            .populate("musics");
        return playlist;
    }

    async updatePlaylist(id, playlistData) {
        const playlist = await Playlist.findByIdAndUpdate(id, playlistData, { new: true });
        return playlist;
    }

    async deletePlaylist(id) {
        const playlist = await Playlist.findByIdAndDelete(id);
        return playlist;
    }

    async addSongToPlaylist(playlistId, musicId) {
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { musics: musicId } }, // $addToSet prevents adding the exact same song multiple times
            { new: true }
        ).populate("user", "username").populate("musics");
        return playlist;
    }

    async removeSongFromPlaylist(playlistId, musicId) {
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { musics: musicId } },
            { new: true }
        ).populate("user", "username").populate("musics");
        return playlist;
    }
}

export default new PlaylistServices();