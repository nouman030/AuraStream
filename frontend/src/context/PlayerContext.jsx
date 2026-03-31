import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef(new Audio());
  
  // Keep refs for callbacks to avoid stale closures
  const stateRef = useRef({ queue, currentSong, isLooping, isShuffle });
  useEffect(() => {
    stateRef.current = { queue, currentSong, isLooping, isShuffle };
  }, [queue, currentSong, isLooping, isShuffle]);

  useEffect(() => {
    const fetchInitialQueue = async () => {
      try {
        const { data } = await axiosInstance.get('/music/all-music');
        if (data.success) {
           const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
           setQueue(data.musics.map((m, i) => ({
             id: m._id,
             title: m.title,
             artist: m.artist,
             url: m.cloudinary_url,
             coverColor: colors[i % colors.length],
             duration: m.duration ? `${Math.floor(m.duration / 60)}:${('0' + Math.floor(m.duration % 60)).slice(-2)}` : '0:00',
           })));
        }
      } catch(e) { console.error("Initial queue error:", e); }
    };
    fetchInitialQueue();
  }, []);

  const playNext = useCallback(() => {
    const { queue: q, currentSong: c, isShuffle: shuff } = stateRef.current;
    if (q.length === 0) return;
    let nextIndex;
    if (shuff) {
      nextIndex = Math.floor(Math.random() * q.length);
    } else {
      const idx = q.findIndex(s => s.id === c?.id);
      nextIndex = idx === -1 ? 0 : (idx + 1) % q.length;
    }
    setCurrentSong(q[nextIndex]);
    setIsPlaying(true);
  }, []);

  const playPrev = useCallback(() => {
    const { queue: q, currentSong: c } = stateRef.current;
    if (q.length === 0) return;
    const idx = q.findIndex(s => s.id === c?.id);
    const prevIndex = idx <= 0 ? q.length - 1 : idx - 1;
    setCurrentSong(q[prevIndex]);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      const { isLooping: loop } = stateRef.current;
      if (!loop) {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying && currentSong) {
      if (audio.src !== currentSong.url) {
         audio.src = currentSong.url || '';
      }
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  const playSong = (song) => {
    // If the same song is already selected, just toggle play
    if (currentSong && currentSong.id === song.id) {
      setIsPlaying(true);
      return;
    }
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const seekFn = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        progress,
        duration,
        volume,
        isLooping,
        isShuffle,
        playSong,
        pauseSong,
        playNext,
        playPrev,
        setQueue,
        setVolume,
        setIsLooping,
        setIsShuffle,
        seekFn,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
