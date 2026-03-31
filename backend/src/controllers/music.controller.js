import MusicServices from "../services/music.service.js";

export const uploadMusic = async (req, res) => {
    try {
        const user = req.user;
        const { title, artist, album, genre, duration} = req.body;
        const cloudinary_url =  req.file.path;       // Cloudinary direct URL
        const cloudinary_id = req.file.filename;
        const music = await MusicServices.createMusic({ user, title, artist, album, genre, duration, cloudinary_url, cloudinary_id });
        res.status(201).json({ success: true, music });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllMusic = async (req, res) => {
    try {
        const musics = await MusicServices.getAllMusic();
        res.status(200).json({ success: true, musics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getMusicById = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await MusicServices.getMusicById(id);
        res.status(200).json({ success: true, music });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await MusicServices.updateMusic(id, req.body);
        res.status(200).json({ success: true, music });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await MusicServices.deleteMusic(id);
        res.status(200).json({ success: true, music });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

