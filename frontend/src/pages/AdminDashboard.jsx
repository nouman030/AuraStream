import React, { useState, useEffect } from 'react';
import { Users, Music as MusicIcon, Mic2, ListMusic, Trash2, Pencil, Shield, User, TrendingUp, Upload } from 'lucide-react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Animated counter hook
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ icon: Icon, label, value, accentColor, glowColor }) => {
  const count = useCountUp(value);
  return (
    <div className="glass-card noise-overlay p-6 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[50px] pointer-events-none opacity-30" style={{ background: glowColor }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">{label}</p>
          <p className="text-4xl font-black font-mono text-white">{count.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: `${accentColor}22` }}>
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: accentColor }}>
        <TrendingUp className="w-3 h-3" /> <span>+12% this month</span>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
    ARTIST: 'bg-brand-violet/20 text-brand-violet border-brand-violet/30',
    USER: 'bg-brand-teal/20 text-brand-teal border-brand-teal/30',
  };
  return (
    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles[role] || styles.USER}`}>
      {role}
    </span>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', artist: '', album: 'Single', genre: 'Electronic', audioFile: null });
  const [editingSong, setEditingSong] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', genre: 'Electronic' });

  const fetchData = async () => {
    try {
      const [usersRes, musicRes] = await Promise.all([
        axiosInstance.get('/auth/all-users').catch(() => ({ data: { users: [] } })),
        axiosInstance.get('/music/all-music').catch(() => ({ data: { success: false, musics: [] } }))
      ]);
      
      if (usersRes?.data?.users) {
        setUsers(usersRes.data.users.map(u => ({
          id: u._id,
          name: u.username,
          email: u.email,
          role: u.role,
          joined: new Date(u.createdAt || Date.now()).toLocaleDateString()
        })));
      }
      
      if (musicRes?.data?.success) {
        const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
        setSongs(musicRes.data.musics.map((m, i) => ({
          id: m._id,
          title: m.title,
          artist: m.artist,
          genre: m.genre || 'Unknown',
          duration: m.duration ? `${Math.floor(m.duration / 60)}:${('0' + Math.floor(m.duration % 60)).slice(-2)}` : '0:00',
          coverColor: colors[i % colors.length],
          url: m.cloudinary_url,
          plays: Math.floor(Math.random() * 50000) + 1000
        })));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      await axiosInstance.delete(`/auth/remove-user/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleDeleteSong = async (id) => {
    try {
      await axiosInstance.delete(`/music/${id}`);
      setSongs(songs.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete song');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.audioFile) return alert("Audio file required");
    
    const mockDurationInSeconds = Math.floor(Math.random() * 120) + 180; 

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('artist', uploadForm.artist);
    formData.append('album', uploadForm.album);
    formData.append('genre', uploadForm.genre);
    formData.append('duration', mockDurationInSeconds);
    formData.append('audio', uploadForm.audioFile);

    try {
      await axiosInstance.post('/music/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setUploadForm({ title: '', artist: '', album: 'Single', genre: 'Electronic', audioFile: null });
      fetchData();
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSong) return;
    try {
      await axiosInstance.put(`/music/${editingSong.id}`, editForm);
      setEditingSong(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update song');
    }
  };

  const stats = {
    totalUsers: users.length,
    totalSongs: songs.length,
    totalArtists: new Set(songs.map(s => s.artist)).size,
    totalPlaylists: 0 // Mocked for now until playlist API exists
  };

  return (
    <div className="w-full fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-brand-gold/20">
          <Shield className="w-6 h-6 text-brand-gold" />
        </div>
        <div>
          <h1 className="text-3xl font-black font-heading text-white">Admin Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Full system control panel</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} accentColor="#06b6d4" glowColor="#06b6d4" />
        <StatCard icon={MusicIcon} label="Total Songs" value={stats.totalSongs} accentColor="#7c3aed" glowColor="#7c3aed" />
        <StatCard icon={Mic2} label="Total Artists" value={stats.totalArtists} accentColor="#f59e0b" glowColor="#f59e0b" />
        <StatCard icon={ListMusic} label="Playlists" value={stats.totalPlaylists} accentColor="#10b981" glowColor="#10b981" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 rounded-xl w-fit mb-8">
        {['overview', 'users', 'songs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${activeTab === tab ? 'bg-brand-violet text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]' : 'text-zinc-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ───────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-border flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-teal" />
              <h2 className="font-bold text-sm">Recent Users</h2>
            </div>
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-6 py-3 border-b border-dark-border/40 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-violet/30 flex items-center justify-center font-bold text-sm text-brand-violet flex-shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.name}</p>
                  <p className="text-zinc-500 text-xs truncate">{u.email}</p>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MusicIcon className="w-4 h-4 text-brand-violet" />
                <h2 className="font-bold text-sm">Recent Songs</h2>
              </div>
              <button onClick={() => setShowUploadModal(true)} className="text-xs text-brand-teal hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Force Add Track
              </button>
            </div>
            {songs.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-6 py-3 border-b border-dark-border/40 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded flex-shrink-0" style={{ background: `linear-gradient(135deg, ${s.coverColor}88, ${s.coverColor}22)` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.title}</p>
                  <p className="text-zinc-500 text-xs truncate">{s.artist} · {s.genre}</p>
                </div>
                <span className="text-zinc-500 text-xs font-mono">{s.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS TAB ───────────────────── */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
            <h2 className="font-bold">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase tracking-widest border-b border-dark-border">
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Role</th>
                  <th className="text-left px-6 py-3">Joined</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-dark-border/40 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-violet/20 flex items-center justify-center font-bold text-xs text-brand-violet">
                          {u.name[0]}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-zinc-400">{u.email}</td>
                    <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-3 text-zinc-500">{u.joined}</td>
                    <td className="px-6 py-3">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => setDeleteConfirm({ type: 'user', id: u.id, name: u.name })}
                          className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SONGS TAB ───────────────────── */}
      {activeTab === 'songs' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
            <h2 className="font-bold">All Songs ({songs.length})</h2>
            <button onClick={() => setShowUploadModal(true)} className="text-sm border border-brand-teal text-brand-teal hover:bg-brand-teal/10 rounded-md px-3 py-1.5 flex items-center gap-1 transition-all">
              <Upload className="w-4 h-4" /> Add Track
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase tracking-widest border-b border-dark-border">
                  <th className="text-left px-6 py-3">Title</th>
                  <th className="text-left px-6 py-3">Artist</th>
                  <th className="text-left px-6 py-3">Genre</th>
                  <th className="text-left px-6 py-3">Duration</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((s) => (
                  <tr key={s.id} className="border-b border-dark-border/40 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex-shrink-0" style={{ background: `linear-gradient(135deg, ${s.coverColor}88, ${s.coverColor}22)` }} />
                        <span className="text-white font-medium">{s.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-zinc-400">{s.artist}</td>
                    <td className="px-6 py-3 text-zinc-500">{s.genre}</td>
                    <td className="px-6 py-3 text-zinc-500 font-mono">{s.duration}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSong(s);
                            setEditForm({ title: s.title, artist: s.artist, genre: s.genre });
                          }}
                          className="p-1.5 rounded text-zinc-600 hover:text-brand-teal hover:bg-brand-teal/10 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'song', id: s.id, name: s.title })}
                          className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="glass-card p-8 w-full max-w-sm m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black font-heading mb-3">Confirm Delete</h3>
            <p className="text-zinc-400 text-sm mb-6">Remove <strong className="text-white">{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
                onClick={() => deleteConfirm.type === 'user' ? handleDeleteUser(deleteConfirm.id) : handleDeleteSong(deleteConfirm.id)}
              >
                Delete
              </button>
              <button className="flex-1 btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Track Modal */}
      {editingSong && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setEditingSong(null)}>
          <div className="glass-card noise-overlay p-8 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black font-heading mb-6">Edit Track</h2>
            <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
              <input className="input-field" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Track title" required />
              <input className="input-field" value={editForm.artist} onChange={e => setEditForm({...editForm, artist: e.target.value})} placeholder="Artist name" required />
              <select className="input-field" value={editForm.genre} onChange={e => setEditForm({...editForm, genre: e.target.value})}>
                {['Electronic', 'Indie', 'Ambient', 'Pop', 'Hip-Hop', 'R&B', 'Post-Rock', 'Synthwave', 'Classical'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="btn-primary flex-1">Save Changes</button>
                <button type="button" onClick={() => setEditingSong(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
          <div className="glass-card noise-overlay p-8 w-full max-w-md m-4 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/20 blur-[60px] rounded-full pointer-events-none" />
            <h2 className="text-2xl font-black font-heading mb-6">Force Add Track</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4 relative z-10">
              <input className="input-field" placeholder="Track title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} required />
              <input className="input-field" placeholder="Artist name" value={uploadForm.artist} onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })} required />
              <input className="input-field" placeholder="Album name" value={uploadForm.album} onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })} required />
              <select className="input-field" value={uploadForm.genre} onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}>
                {['Electronic', 'Indie', 'Ambient', 'Pop', 'Hip-Hop', 'R&B', 'Post-Rock', 'Synthwave', 'Classical'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <label className="flex flex-col gap-2">
                <span className="text-xs text-zinc-400 uppercase tracking-widest">Audio File (Required)</span>
                <div className="input-field cursor-pointer border-dashed text-zinc-500 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>{uploadForm.audioFile ? uploadForm.audioFile.name : 'Click to upload audio...'}</span>
                  <input type="file" accept="audio/*" className="absolute opacity-0 w-0 h-0" onChange={(e) => setUploadForm({ ...uploadForm, audioFile: e.target.files[0] })} required />
                </div>
              </label>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="btn-primary flex-1">Upload Track</button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
