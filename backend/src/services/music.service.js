import { Music } from "../models/music.model.js";


class MusicServices {
    async createMusic(musicData) {
        const { user, title, artist, album, genre, duration, cloudinary_url, cloudinary_id } = musicData;
        const music = await Music.create({ user, title, artist, album, genre, cloudinary_url, cloudinary_id, duration });
        return music;
    }

    async getAllMusic() {
        const musics = await Music.find();
        return musics;
    }

    async getMusicById(id) {
        const music = await Music.findById(id);
        return music;
    }

    async updateMusic(id, musicData) {
        const music = await Music.findByIdAndUpdate(id, musicData, { new: true });
        return music;
    }

    async deleteMusic(id) {
        const music = await Music.findByIdAndDelete(id);
        return music;
    }
}

export default new MusicServices();