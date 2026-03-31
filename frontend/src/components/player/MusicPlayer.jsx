import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat, ListMusic, Heart, ChevronUp } from 'lucide-react';

const MusicPlayer = () => {
  const { currentSong, isPlaying, playSong, pauseSong, progress, duration, seekFn, volume, setVolume, isLooping, setIsLooping, isShuffle, setIsShuffle, playNext, playPrev } = usePlayer();
  const progressBarRef = useRef();
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? Math.min((progress / duration) * 100, 100) : 0;

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekFn(percent * duration);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <>
      {/* ── MAIN PLAYER BAR ──────────────────── */}
      <div
        className="fixed bottom-0 left-0 w-full z-50 flex flex-col"
        style={{ background: 'rgba(8,8,13,0.97)', backdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Progress bar (full-width, click to seek) */}
        <div
          ref={progressBarRef}
          className="w-full h-1 bg-zinc-900 cursor-pointer group relative"
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full transition-none group-hover:h-1.5 -mt-0"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
              transition: isDragging ? 'none' : 'width 0.1s linear',
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 translate-x-1/2 shadow-lg" />
          </div>
        </div>

        {/* Player content */}
        <div className="flex items-center justify-between px-4 md:px-6 h-[72px] gap-4">
          {/* Left — Song Info */}
          <div className="flex items-center gap-3 w-1/3 min-w-0">
            {/* Album art */}
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xl font-heading text-white relative overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${currentSong.coverColor || '#7c3aed'}88, ${currentSong.coverColor || '#7c3aed'}22)`,
                animation: isPlaying ? 'spin 12s linear infinite' : 'none',
              }}
            >
              <span className="opacity-30">{currentSong.title?.[0]}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-zinc-500 text-xs truncate">{currentSong.artist}</p>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex-shrink-0 transition-all duration-200 ml-1 ${liked ? 'text-brand-gold' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-brand-gold' : ''}`} />
            </button>
          </div>

          {/* Center — Controls */}
          <div className="flex flex-col items-center flex-1 max-w-2xl">
            <div className="flex items-center gap-4 md:gap-6 mb-1.5">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`hidden sm:block transition-colors ${isShuffle ? 'text-brand-violet' : 'text-zinc-600 hover:text-white'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={playPrev} className="text-zinc-400 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={isPlaying ? pauseSong : () => playSong(currentSong)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                {isPlaying
                  ? <Pause className="w-4 h-4 fill-zinc-900 text-zinc-900" />
                  : <Play className="w-4 h-4 fill-zinc-900 text-zinc-900 ml-0.5" />}
              </button>
              <button onClick={playNext} className="text-zinc-400 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`hidden sm:block transition-colors ${isLooping ? 'text-brand-teal' : 'text-zinc-600 hover:text-white'}`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
            {/* Time */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 font-mono w-full max-w-xs">
              <span className="w-10 text-right">{formatTime(progress)}</span>
              <div className="flex-1 h-0.5 bg-zinc-800 rounded-full">
                <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: '#7c3aed' }} />
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right — Volume + Queue */}
          <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
            <button className="text-zinc-600 hover:text-white transition-colors">
              <ListMusic className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-zinc-500 hover:text-white transition-colors">
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#7c3aed' }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
