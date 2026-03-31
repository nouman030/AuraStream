import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Pencil, Trash2, PlusCircle, ChevronLeft, Clock, Globe, Lock } from 'lucide-react';
import axiosInstance from '../api/axios';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying, pauseSong, setQueue } = usePlayer();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const [playlist, setPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [editForm, setEditForm] = useState({ name: '', description: '', visibility: 'public' });

  const fetchPlaylist = async () => {
    try {
      const { data } = await axiosInstance.get(`/playlist/playlist/${id}`);
      if (data.success && data.playlist) {
        const p = data.playlist;
        const mappedP = {
          id: p._id,
          name: p.name,
          description: p.description,
          isPublic: p.visibility === 'public',
          owner: p.user?.username || p.user?.name || 'AuraStream User',
          ownerId: p.user?._id || p.user,
          colors: ['#7c3aed', '#06b6d4'],
        };
        setPlaylist(mappedP);
        setEditForm({ name: mappedP.name, description: mappedP.description, visibility: p.visibility || 'public' });

        const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
        if (p.musics) {
          setPlaylistSongs(p.musics.map((m, i) => ({
            id: m._id,
            title: m.title,
            artist: m.artist,
            duration: m.duration ? `${Math.floor(m.duration / 60)}:${('0' + Math.floor(m.duration % 60)).slice(-2)}` : '0:00',
            coverColor: colors[i % colors.length],
            url: m.cloudinary_url
          })));
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Please log in to view this playlist.");
        navigate('/auth');
      }
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const handleDeletePlaylist = async () => {
     if(window.confirm("Delete this playlist permanently?")) {
        try {
           await axiosInstance.delete(`/playlist/playlist/${id}`);
           navigate('/playlists');
        } catch(err) {
           alert("Failed to delete playlist.");
        }
     }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        await axiosInstance.put(`/playlist/playlist/${id}`, { 
          name: editForm.name, 
          description: editForm.description,
          visibility: editForm.visibility
        });
        setShowEditModal(false);
        fetchPlaylist();
    } catch (err) {
        alert("Failed to update playlist");
    }
  };

  const handleRemoveSong = async (musicId) => {
     try {
         await axiosInstance.delete(`/playlist/playlist/${id}/remove-song`, { data: { musicId } });
         fetchPlaylist();
     } catch (err) {
         alert("Failed to remove song");
     }
  };

  const openAddSongModal = async () => {
    try {
      const { data } = await axiosInstance.get('/music/all-music');
      if (data.success) {
        setAvailableSongs(data.musics);
        setShowAddSongModal(true);
      }
    } catch (err) {
      alert("Failed to load available songs");
    }
  };

  const handleAddSong = async (musicId) => {
    try {
      await axiosInstance.post(`/playlist/playlist/${id}/add-song`, { musicId });
      setShowAddSongModal(false);
      fetchPlaylist();
    } catch (err) {
      alert("Failed to add song to playlist");
    }
  };

  const handlePlayAll = () => {
    if (!playlistSongs.length) return;
    const isReady = currentSong?.id === playlistSongs[0].id;
    if (isReady && isPlaying) {
      pauseSong();
    } else {
      setQueue(playlistSongs);
      playSong(playlistSongs[0]);
    }
  };

  if (!playlist) return <div className="p-10 text-center text-zinc-500">Loading playlist...</div>;

  const isOwner = user && (user.id === playlist.ownerId || user.role === 'ADMIN' || user.username === playlist.owner);

  const totalDuration = playlistSongs.reduce((acc, s) => {
    const [min, sec] = s.duration.split(':').map(Number);
    return acc + (min * 60) + sec;
  }, 0);
  const totalMin = Math.floor(totalDuration / 60);

  return (
    <div className="w-full max-w-5xl mx-auto fade-in">
      <Link to="/playlists" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-8 group transition-colors">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> All Playlists
      </Link>

      {/* ── HERO ─────────────────────────── */}
      <div className="glass-card noise-overlay overflow-hidden mb-8">
        <div
          className="h-56 relative flex items-end p-8"
          style={{ background: `linear-gradient(135deg, ${playlist.colors[0]}, ${playlist.colors[1]})` }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute rounded-full border border-white" style={{ width: `${(i + 1) * 15}%`, height: `${(i + 1) * 15}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            ))}
          </div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-2">
              {playlist.isPublic ? <Globe className="w-3 h-3 text-white/60" /> : <Lock className="w-3 h-3 text-white/60" />}
              <span className="text-xs text-white/60 uppercase tracking-widest">Playlist · {playlist.isPublic ? 'Public' : 'Private'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-heading text-white leading-tight">{playlist.name}</h1>
          </div>
        </div>

        <div className="px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-dark-border">
          <div className="flex-1">
            <p className="text-zinc-300 text-sm mb-1">{playlist.description}</p>
            <p className="text-zinc-500 text-xs">Created by <strong className="text-zinc-300">{playlist.owner}</strong> · {playlistSongs.length} songs, {totalMin} min</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="btn-primary inline-flex items-center gap-2"
            >
              {currentSong?.id === playlistSongs[0]?.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              {currentSong?.id === playlistSongs[0]?.id && isPlaying ? 'Pause' : 'Play All'}
            </button>
            {isOwner && (
              <>
                <button onClick={() => setShowEditModal(true)} className="p-2.5 rounded-xl border border-dark-border text-zinc-400 hover:text-brand-teal hover:border-brand-teal/50 transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={handleDeletePlaylist} className="p-2.5 rounded-xl border border-dark-border text-zinc-400 hover:text-red-400 hover:border-red-400/50 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── SONG LIST ───────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_8rem_4rem_2rem] gap-4 items-center px-6 py-3 text-xs text-zinc-500 uppercase tracking-widest border-b border-dark-border">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /></span>
          <span></span>
        </div>

        {playlistSongs.map((song, idx) => {
          const active = currentSong?.id === song.id && isPlaying;
          return (
            <div
              key={song.id}
              className={`grid grid-cols-[2rem_1fr_8rem_4rem_2rem] gap-4 items-center px-6 py-3 border-b border-dark-border/40 last:border-0 cursor-pointer transition-colors group ${active ? 'bg-brand-violet/10' : 'hover:bg-white/[0.03]'}`}
              onMouseEnter={() => setHoveredRow(song.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => {
                if (active) pauseSong();
                else {
                  setQueue(playlistSongs);
                  playSong(song);
                }
              }}
            >
              <div className="text-zinc-500 text-xs font-mono w-4">
                {hoveredRow === song.id ? (
                  active ? <Pause className="w-4 h-4 text-brand-violet" /> : <Play className="w-4 h-4 fill-white text-white" />
                ) : active ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[1, 2, 3].map((h, i) => <div key={i} className="w-0.5 bg-brand-violet rounded-sm animate-pulse" style={{ height: `${h * 33}%` }} />)}
                  </div>
                ) : (
                  idx + 1
                )}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded flex-shrink-0" style={{ background: `linear-gradient(135deg, ${song.coverColor}88, ${song.coverColor}22)` }} />
                <Link to={`/music/${song.id}`} onClick={(e) => e.stopPropagation()} className={`font-medium text-sm truncate hover:underline ${active ? 'text-brand-violet' : 'text-white'}`}>
                  {song.title}
                </Link>
              </div>
              <span className="text-zinc-400 text-xs truncate">{song.artist}</span>
              <span className="text-zinc-500 text-xs font-mono">{song.duration}</span>
              {isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {user && isOwner && (
          <div className="px-6 py-4 border-t border-dark-border">
            <button
              onClick={openAddSongModal}
              className="flex items-center gap-2 text-zinc-500 hover:text-brand-teal text-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Add songs to playlist
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
          <div className="glass-card noise-overlay p-8 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black font-heading mb-6">Edit Playlist</h2>
            <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
              <input className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Playlist name" required />
              <textarea className="input-field resize-none" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description" />
              <div className="flex flex-col gap-2">
                <span className="text-xs text-zinc-400 uppercase tracking-widest">Visibility</span>
                <select className="input-field" value={editForm.visibility} onChange={e => setEditForm({...editForm, visibility: e.target.value})}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="btn-primary flex-1">Save Changes</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Song Modal */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAddSongModal(false)}>
          <div className="glass-card noise-overlay p-8 w-full max-w-lg m-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black font-heading mb-6">Add Song to Playlist</h2>
            <div className="overflow-y-auto pr-2 space-y-2 flex-1">
              {availableSongs.filter(s => !playlistSongs.some(ps => ps.id === s._id)).map(song => (
                <div key={song._id} className="flex items-center justify-between p-3 glass-card hover:bg-white/[0.05] transition-colors rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-white">{song.title}</p>
                    <p className="text-xs text-zinc-400">{song.artist}</p>
                  </div>
                  <button onClick={() => handleAddSong(song._id)} className="btn-primary text-xs py-1.5 px-3">
                    Add
                  </button>
                </div>
              ))}
              {availableSongs.filter(s => !playlistSongs.some(ps => ps.id === s._id)).length === 0 && (
                <p className="text-center text-zinc-500 text-sm mt-4">No new songs available to add.</p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-dark-border flex justify-end">
              <button type="button" onClick={() => setShowAddSongModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
