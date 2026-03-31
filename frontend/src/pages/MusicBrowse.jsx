import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, Grid, List, Clock, TrendingUp, Upload, Loader, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const GENRES = ['All', 'Electronic', 'Indie', 'Ambient', 'Pop', 'Hip-Hop', 'R&B', 'Post-Rock', 'Synthwave', 'Classical'];

const formatPlays = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
};

const MusicBrowse = () => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredSong, setHoveredSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read ?q= from URL param so Navbar search navigates here correctly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(decodeURIComponent(q));
  }, []);

  useEffect(() => {
    const fetchMusic = async () => {
      setIsLoading(true);
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
            plays: Math.floor(Math.random() * 50000) + 1000
          }));
          setSongs(mappedSongs);
        }
      } catch (error) {
        console.error("Error fetching music:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusic();
  }, []);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        song.title?.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.genre?.toLowerCase().includes(q);
      const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [songs, searchQuery, selectedGenre]);

  const isCurrentlyPlaying = (song) => currentSong?.id === song.id && isPlaying;

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader className="w-8 h-8 animate-spin text-brand-violet" />
        <p className="text-sm">Loading tracks...</p>
      </div>
    );
  }

  return (
    <div className="w-full fade-in">
      {/* ── PAGE HEADER ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading text-white">Browse Music</h1>
          <p className="text-zinc-400 text-sm mt-1">{filteredSongs.length} tracks available</p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'ADMIN' || user?.role === 'ARTIST') && (
            <Link to={user?.role === 'ADMIN' ? '/admin' : '/artist'} className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
              <Upload className="w-4 h-4" /> Upload Track
            </Link>
          )}
        </div>
      </div>

      {/* ── FILTERS ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title, artist, or genre..."
            className="input-field pl-11 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 glass-card p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-violet/30 text-brand-violet' : 'text-zinc-500 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-violet/30 text-brand-violet' : 'text-zinc-500 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── GENRE PILLS ─────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-8">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              selectedGenre === genre
                ? 'bg-brand-violet text-white border-brand-violet shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                : 'bg-transparent text-zinc-400 border-dark-border hover:border-brand-violet/50 hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* ── RESULTS: GRID VIEW ──────────────────── */}
      {viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className={`glass-card noise-overlay flex flex-col cursor-pointer group hover:-translate-y-1 transition-all duration-300 ${isCurrentlyPlaying(song) ? 'ring-1 ring-brand-violet shadow-[0_0_20px_rgba(124,58,237,0.3)]' : ''}`}
                onMouseEnter={() => setHoveredSong(song.id)}
                onMouseLeave={() => setHoveredSong(null)}
                onClick={() => playSong(song)}
              >
                <div
                  className="aspect-square relative overflow-hidden rounded-t-2xl"
                  style={{ background: `linear-gradient(135deg, ${song.coverColor}88, ${song.coverColor}22)` }}
                >
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-white opacity-15 font-heading select-none">
                    {song.title[0]}
                  </span>
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/30 ${hoveredSong === song.id || isCurrentlyPlaying(song) ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-xl">
                      {isCurrentlyPlaying(song) ? (
                        <div className="flex items-end gap-0.5 h-4">
                          {[1,2,3].map(b => (
                            <div key={b} className="w-1 bg-dark-base rounded-sm animate-pulse" style={{ height: `${b * 33}%`, animationDelay: `${b * 0.12}s` }} />
                          ))}
                        </div>
                      ) : (
                        <Play className="w-5 h-5 fill-dark-base text-dark-base ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <Link to={`/music/${song.id}`} onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-white text-xs font-semibold truncate hover:text-brand-teal transition-colors">{song.title}</h4>
                  </Link>
                  <p className="text-zinc-500 text-xs truncate mt-0.5">{song.artist}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-zinc-600 text-xs">{song.genre}</span>
                    <span className="text-zinc-600 text-xs flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" /> {formatPlays(song.plays)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredSongs.length === 0 && (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p className="text-white font-semibold mb-1">No tracks found</p>
              <p className="text-zinc-500 text-sm">
                {searchQuery ? <>No results for "<span className="text-zinc-300">{searchQuery}</span>"</> : 'Try a different genre'}
              </p>
              {(searchQuery || selectedGenre !== 'All') && (
                <button onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }} className="mt-4 text-brand-teal text-sm hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── RESULTS: LIST VIEW ──────────────────── */}
      {viewMode === 'list' && (
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_6rem_4rem] gap-4 items-center px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest border-b border-dark-border">
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span>Genre</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
          </div>
          {filteredSongs.map((song, idx) => (
            <div
              key={song.id}
              className={`grid grid-cols-[2rem_1fr_1fr_6rem_4rem] gap-4 items-center px-6 py-3 border-b border-dark-border/50 cursor-pointer transition-colors group ${isCurrentlyPlaying(song) ? 'bg-brand-violet/10 text-brand-violet' : 'hover:bg-white/[0.03] text-zinc-300'}`}
              onMouseEnter={() => setHoveredSong(song.id)}
              onMouseLeave={() => setHoveredSong(null)}
              onClick={() => playSong(song)}
            >
              <div className="text-zinc-500 text-sm font-mono">
                {hoveredSong === song.id ? (
                  <Play className="w-4 h-4 fill-white text-white" />
                ) : isCurrentlyPlaying(song) ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[1,2,3].map(b => <div key={b} className="w-0.5 bg-brand-violet rounded-sm animate-pulse" style={{ height: `${(b % 2 === 0 ? 60 : 100)}%` }} />)}
                  </div>
                ) : (
                  idx + 1
                )}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded flex-shrink-0" style={{ background: `linear-gradient(135deg, ${song.coverColor}88, ${song.coverColor}33)` }} />
                <Link to={`/music/${song.id}`} onClick={(e) => e.stopPropagation()} className={`font-medium text-sm truncate hover:text-brand-teal transition-colors ${isCurrentlyPlaying(song) ? 'text-brand-violet' : 'text-white'}`}>
                  {song.title}
                </Link>
              </div>
              <span className="text-sm text-zinc-400 truncate">{song.artist}</span>
              <span className="text-xs text-zinc-500 truncate">{song.genre}</span>
              <span className="text-xs text-zinc-500 font-mono">{song.duration}</span>
            </div>
          ))}

          {filteredSongs.length === 0 && (
            <div className="py-16 text-center text-zinc-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No songs matched your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicBrowse;
