import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, PlusSquare, Share2, MoreHorizontal, ChevronLeft, ArrowUpRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

// Simple static waveform visualizer
const WaveformBar = ({ height, active }) => (
  <div
    className="w-1 rounded-sm flex-shrink-0 transition-all duration-150"
    style={{
      height: `${height}%`,
      background: active
        ? 'linear-gradient(to top, #7c3aed, #06b6d4)'
        : 'rgba(255,255,255,0.12)',
    }}
  />
);

const StaticWaveform = ({ progress = 0 }) => {
  const bars = Array.from({ length: 60 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(i * 0.4 + Math.cos(i * 0.15)) * 80);
    return { height: h, active: i / 60 < progress };
  });

  return (
    <div className="flex items-center gap-0.5 h-20 w-full">
      {bars.map((b, i) => <WaveformBar key={i} height={b.height} active={b.active} />)}
    </div>
  );
};

const SongDetail = () => {
  const { id } = useParams();
  const { playSong, pauseSong, currentSong, isPlaying, progress, duration } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const { data } = await axiosInstance.get('/music/all-music');
        if (data.success) {
          const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
          const mappedSongs = data.musics.map((m, i) => ({
            id: m._id,
            title: m.title,
            artist: m.artist,
            genre: m.genre || 'Unknown',
            duration: m.duration ? `${Math.floor(m.duration / 60)}:${('0' + Math.floor(m.duration % 60)).slice(-2)}` : '0:00',
            coverColor: colors[i % colors.length],
            url: m.cloudinary_url,
            plays: Math.floor(Math.random() * 50000) + 1000 // mock plays
          }));
          setSongs(mappedSongs);
        }
      } catch (error) {
        console.error("Error fetching music:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, []);

  if (loading) return <div className="w-full text-center py-20 text-brand-violet">Loading song data...</div>;

  // Find the song — fallback to first if not found
  const song = songs.find((s) => s.id === id) || songs[0];
  if (!song) return <div className="w-full text-center py-20 text-zinc-500">Song not found.</div>;

  const relatedSongs = songs.filter((s) => s.artist === song.artist && s.id !== song.id);
  const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
  const progressPercent = currentSong?.id === song.id && duration ? progress / duration : 0;

  const handlePlay = () => {
    if (isThisSongPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      {/* Back nav */}
      <Link to="/music" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-8 group transition-colors">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Music
      </Link>

      {/* ── MAIN HERO ────────────────────────── */}
      <div className="glass-card noise-overlay p-8 mb-8 relative overflow-hidden">
        {/* Ambient glow from cover color */}
        <div
          className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: song.coverColor + '33' }}
        />

        <div className="flex flex-col sm:flex-row gap-8 relative z-10">
          {/* Cover art */}
          <div
            className="w-48 h-48 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black text-6xl font-heading shadow-2xl relative"
            style={{
              background: `linear-gradient(135deg, ${song.coverColor}cc, ${song.coverColor}44)`,
              boxShadow: `0 20px 60px ${song.coverColor}44`,
            }}
          >
            <span className="opacity-30">{song.title[0]}</span>
            {isThisSongPlaying && (
              <div className="absolute bottom-3 right-3 flex items-end gap-0.5 h-5">
                {[1, 2, 3, 2, 1].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-sm animate-pulse"
                    style={{ height: `${h * 25}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Single · {song.genre}</span>
            <h1 className="text-4xl md:text-5xl font-black font-heading text-white mb-2 leading-tight">
              {song.title}
            </h1>
            <Link to="/music" className="text-zinc-300 text-lg hover:text-white transition-colors inline-flex items-center gap-1 mb-6">
              {song.artist} <ArrowUpRight className="w-4 h-4 opacity-50" />
            </Link>
            <p className="text-zinc-500 text-sm mb-6">{(song.plays / 1000).toFixed(0)}K plays · {song.duration}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePlay}
                className="btn-primary inline-flex items-center gap-2"
              >
                {isThisSongPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                {isThisSongPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`p-3 rounded-full border transition-all duration-200 ${liked ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-dark-border text-zinc-400 hover:text-white hover:border-white/30'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-brand-gold' : ''}`} />
              </button>
              <button className="p-3 rounded-full border border-dark-border text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-200">
                <PlusSquare className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border border-dark-border text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-200">
                <Share2 className="w-5 h-5" />
              </button>
              {(user?.role === 'ADMIN' || user?.role === 'ARTIST') && (
                <button className="p-3 rounded-full border border-dark-border text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-200">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── WAVEFORM ─────────────────────────── */}
      <div className="glass-card noise-overlay p-6 mb-8">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Audio Preview</h3>
        <StaticWaveform progress={progressPercent} />
        <div className="flex justify-between mt-2 text-xs text-zinc-600 font-mono">
          <span>0:00</span>
          <span>{song.duration}</span>
        </div>
      </div>

      {/* ── MORE FROM ARTIST ──────────────────── */}
      {relatedSongs.length > 0 && (
        <div className="glass-card overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-dark-border">
            <h3 className="text-lg font-bold font-heading">More from {song.artist}</h3>
          </div>
          {relatedSongs.map((rs, idx) => (
            <Link to={`/music/${rs.id}`} key={rs.id}>
              <div className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.03] border-b border-dark-border/50 last:border-0 transition-colors group cursor-pointer">
                <span className="text-zinc-600 text-xs w-4 text-center">{idx + 1}</span>
                <div className="w-9 h-9 rounded flex-shrink-0" style={{ background: `linear-gradient(135deg, ${rs.coverColor}88, ${rs.coverColor}22)` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-brand-teal transition-colors">{rs.title}</p>
                  <p className="text-zinc-500 text-xs truncate">{rs.genre}</p>
                </div>
                <span className="text-zinc-500 text-xs font-mono">{rs.duration}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongDetail;
