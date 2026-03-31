import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Globe, Play, PlusSquare, Music } from 'lucide-react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PlaylistCard = ({ playlist }) => (
  <Link to={`/playlists/${playlist.id}`}>
    <div className="glass-card noise-overlay overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all duration-300">
      {/* Gradient header */}
      <div
        className="h-36 relative flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${playlist.colors[0]}, ${playlist.colors[1]})` }}
      >
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <Music className="w-24 h-24 text-white" />
        </div>
        {/* Lock badge */}
        <div className={`absolute top-3 right-3 p-1.5 rounded-full ${playlist.isPublic ? 'bg-white/10' : 'bg-black/40'}`}>
          {playlist.isPublic ? <Globe className="w-3 h-3 text-white/60" /> : <Lock className="w-3 h-3 text-white/60" />}
        </div>
        {/* Play button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 fill-dark-base text-dark-base ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-sm mb-1 truncate">{playlist.name}</h3>
        <p className="text-zinc-400 text-xs mb-2 line-clamp-2">{playlist.description}</p>
        <p className="text-zinc-600 text-xs">{playlist.songs} songs · by {playlist.owner}</p>
      </div>
    </div>
  </Link>
);

const Playlists = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('public');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: true });
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = async () => {
    try {
      const endpoint = activeTab === 'public' ? '/playlist/all-playlists' : '/playlist/my-playlists';
      const { data } = await axiosInstance.get(endpoint);
      if (data.success && data.playlists) {
        const colorsList = [
          ['#7c3aed', '#06b6d4'],
          ['#ec4899', '#f59e0b'],
          ['#10b981', '#3b82f6'],
          ['#f43f5e', '#a855f7']
        ];
        
        const mapped = data.playlists.map((p, i) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          isPublic: p.visibility === 'public',
          songs: p.musics ? p.musics.length : 0,
          owner: p.user?.username || p.user?.name || 'AuraStream User',
          colors: colorsList[i % colorsList.length]
        }));
        setPlaylists(mapped);
      } else {
        setPlaylists([]);
      }
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      setPlaylists([]);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/playlist/create', {
        name: newPlaylist.name,
        description: newPlaylist.description || ' ',
        visibility: newPlaylist.isPublic ? 'public' : 'private'
      });
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', isPublic: true });
      fetchPlaylists();
    } catch (err) {
      alert('Failed to create playlist');
      console.error(err);
    }
  };

  return (
    <div className="w-full fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading text-white">Playlists</h1>
          <p className="text-zinc-400 text-sm mt-1">Discover and manage your music collections</p>
        </div>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
          >
            <PlusSquare className="w-4 h-4" /> New Playlist
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('public')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'public' ? 'bg-brand-violet text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'text-zinc-400 hover:text-white'}`}
        >
          Public Playlists
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'mine' ? 'bg-brand-violet text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'text-zinc-400 hover:text-white'}`}
          >
            My Library
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {playlists.map((pl) => (
          <PlaylistCard key={pl.id} playlist={pl} />
        ))}
        {activeTab === 'mine' && !user && (
          <div className="col-span-full py-16 text-center text-zinc-500">
            <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Sign in to view your library</p>
            <Link to="/auth" className="btn-primary inline-block mt-4 text-sm py-2 px-5">Log In</Link>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="glass-card noise-overlay p-8 w-full max-w-md m-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/20 blur-[60px] rounded-full pointer-events-none" />
            <h2 className="text-2xl font-black font-heading mb-6">Create Playlist</h2>
            <form className="flex flex-col gap-4" onSubmit={handleCreate}>
              <input
                className="input-field"
                placeholder="Playlist name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                required
              />
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Description (optional)"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
              />
              <label className="flex items-center gap-3 cursor-pointer text-sm text-zinc-300">
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${newPlaylist.isPublic ? 'bg-brand-violet' : 'bg-zinc-700'}`}
                  onClick={() => setNewPlaylist({ ...newPlaylist, isPublic: !newPlaylist.isPublic })}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${newPlaylist.isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                {newPlaylist.isPublic ? 'Public' : 'Private'}
              </label>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
