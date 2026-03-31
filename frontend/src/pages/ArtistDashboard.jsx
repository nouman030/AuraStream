import React, { useState, useEffect } from 'react';
import { Mic2, Upload, Pencil, Trash2, TrendingUp, Play, Music } from 'lucide-react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const ArtistDashboard = () => {
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', artist: user?.username || user?.name || '', album: 'Single', genre: 'Electronic', audioFile: null, coverImage: null });
  const [activeTab, setActiveTab] = useState('songs');
  const [editingSong, setEditingSong] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', genre: 'Electronic' });
  const [songs, setSongs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  const [uploadError, setUploadError] = useState('');

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get('/music/all-music');
      if (data.success) {
        const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
        setSongs(data.musics.map((m, i) => ({
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
      console.error('Error fetching artist music:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter songs by the logged in artist name
  const authorName = (user?.username || user?.name || '').toLowerCase();
  const mySongs = songs.filter(s => s.artist.toLowerCase() === authorName);
  const totalPlays = mySongs.reduce((acc, s) => acc + s.plays, 0);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.audioFile) return;

    const mockDurationInSeconds = Math.floor(Math.random() * 120) + 180;

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('artist', uploadForm.artist);
    formData.append('album', uploadForm.album);
    formData.append('genre', uploadForm.genre);
    formData.append('duration', mockDurationInSeconds);
    formData.append('audio', uploadForm.audioFile);

    setUploadProgress(0);
    setUploadStatus('uploading');
    setUploadError('');

    try {
      await axiosInstance.post('/music/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            // Bytes uploaded → percent (cap at 95% until server responds)
            const pct = Math.min(
              Math.round((progressEvent.loaded * 100) / progressEvent.total),
              95
            );
            setUploadProgress(pct);
            if (pct >= 95) setUploadStatus('processing');
          }
        },
      });
      // Server responded — upload fully done
      setUploadProgress(100);
      setUploadStatus('done');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadProgress(0);
        setUploadStatus('idle');
        setUploadForm({ ...uploadForm, title: '', audioFile: null });
        fetchData();
      }, 1200);
    } catch (err) {
      console.error('Error uploading:', err);
      setUploadStatus('error');
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    }
  };

  const closeUploadModal = () => {
    if (uploadStatus === 'uploading' || uploadStatus === 'processing') return; // block close during upload
    setShowUploadModal(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this track?')) {
      try {
        await axiosInstance.delete(`/music/${id}`);
        setSongs(songs.filter(s => s.id !== id));
      } catch (err) {
        console.error(err);
        alert('Delete failed');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSong) return;
    try {
      await axiosInstance.put(`/music/${editingSong.id}`, editForm);
      setEditingSong(null);
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
      alert('Failed to update song');
    }
  };

  return (
    <div className="w-full fade-in">
      {/* ── ARTIST PROFILE HEADER ─── */}
      <div className="glass-card noise-overlay p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-teal/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-violet to-brand-teal flex items-center justify-center text-3xl font-black font-heading text-white shadow-[0_0_40px_rgba(124,58,237,0.4)] flex-shrink-0">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <Mic2 className="w-4 h-4 text-brand-violet" />
              <span className="text-xs text-brand-violet uppercase tracking-widest font-bold">Verified Artist</span>
            </div>
            <h1 className="text-4xl font-black font-heading text-white mb-2">{user?.username || user?.name || 'Artist Name'}</h1>
            <p className="text-zinc-400 text-sm max-w-lg">Electronic music producer and sound designer. Creating sonic landscapes that blur the line between the digital and organic.</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary inline-flex items-center gap-2 flex-shrink-0">
            <Upload className="w-4 h-4" /> Upload Track
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mt-8 pt-6 border-t border-dark-border relative z-10">
          {[
            { label: 'Tracks', value: mySongs.length, color: '#7c3aed' },
            { label: 'Total Plays', value: `${(totalPlays / 1000).toFixed(0)}K`, color: '#06b6d4' },
            { label: 'Followers', value: '2.4M', color: '#f59e0b' },
            { label: 'Avg. Rating', value: '4.8★', color: '#10b981' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ─── */}
      <div className="flex gap-1 glass-card p-1 rounded-xl w-fit mb-8">
        {['songs', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${activeTab === tab ? 'bg-brand-violet text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]' : 'text-zinc-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── MY SONGS TAB ─── */}
      {activeTab === 'songs' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
            <h2 className="font-bold">My Tracks ({mySongs.length})</h2>
            <button onClick={() => setShowUploadModal(true)} className="text-xs text-brand-teal hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Upload New
            </button>
          </div>
          {mySongs.map((song, idx) => (
            <div key={song.id} className="flex items-center gap-4 px-6 py-4 border-b border-dark-border/50 last:border-0 hover:bg-white/[0.02] transition-colors group">
              <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${song.coverColor}88, ${song.coverColor}22)` }}>
                <span className="text-white font-black text-sm opacity-40">{song.title[0]}</span>
                <button onClick={() => playSong(song)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  <Play className="w-4 h-4 fill-white text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{song.title}</p>
                <p className="text-zinc-500 text-xs">{song.genre} · {song.duration}</p>
              </div>
              <div className="flex items-center gap-1 text-zinc-500 text-xs mr-4">
                <TrendingUp className="w-3 h-3" /> {(song.plays / 1000).toFixed(0)}K plays
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingSong(song);
                    setEditForm({ title: song.title, artist: song.artist, genre: song.genre });
                  }}
                  className="p-1.5 rounded text-zinc-500 hover:text-brand-teal hover:bg-brand-teal/10 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ANALYTICS TAB ─── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-teal" /> Top Tracks by Plays</h3>
            <div className="space-y-3">
              {mySongs.sort((a, b) => b.plays - a.plays).map((song, i) => (
                <div key={song.id} className="flex items-center gap-3">
                  <span className="text-zinc-600 text-xs w-4 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white mb-1">{song.title}</p>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(song.plays / mySongs[0].plays) * 100}%`,
                          background: `linear-gradient(90deg, #7c3aed, #06b6d4)`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">{(song.plays / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Music className="w-4 h-4 text-brand-violet" /> Genre Distribution</h3>
            <div className="space-y-3">
              {[{genre: 'Electronic', pct: 65, color: '#7c3aed'}, {genre: 'Ambient', pct: 25, color: '#06b6d4'}, {genre: 'Synthwave', pct: 10, color: '#f59e0b'}].map((g) => (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="text-zinc-300 text-xs w-20">{g.genre}</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                  </div>
                  <span className="text-zinc-500 text-xs w-8 text-right">{g.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD MODAL ─── */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeUploadModal}
        >
          <div className="glass-card noise-overlay p-8 w-full max-w-md m-4 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/20 blur-[60px] rounded-full pointer-events-none" />
            <h2 className="text-2xl font-black font-heading mb-6">Upload New Track</h2>

            {/* ── Progress overlay shown while uploading ── */}
            {(uploadStatus === 'uploading' || uploadStatus === 'processing' || uploadStatus === 'done') && (
              <div className="relative z-10 mb-5">
                {/* Phase label */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-300">
                    {uploadStatus === 'done'
                      ? '✅ Upload complete!'
                      : uploadStatus === 'processing'
                      ? '⚙️ Processing on server...'
                      : '🚀 Uploading to cloud...'}
                  </span>
                  <span
                    className="text-sm font-black font-mono"
                    style={{ color: uploadStatus === 'done' ? '#10b981' : uploadStatus === 'processing' ? '#f59e0b' : '#06b6d4' }}
                  >
                    {uploadProgress}%
                  </span>
                </div>

                {/* Track bar */}
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{
                      width: `${uploadProgress}%`,
                      background:
                        uploadStatus === 'done'
                          ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                          : uploadStatus === 'processing'
                          ? 'linear-gradient(90deg, #f59e0b, #7c3aed)'
                          : 'linear-gradient(90deg, #06b6d4, #7c3aed)',
                    }}
                  >
                    {/* Shimmer effect */}
                    {uploadStatus !== 'done' && (
                      <div
                        className="absolute inset-0 w-1/2"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                          animation: 'shimmer 1.2s ease-in-out infinite',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* File info */}
                {uploadForm.audioFile && (
                  <p className="text-zinc-600 text-xs mt-2 truncate">
                    📁 {uploadForm.audioFile.name} · {(uploadForm.audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            )}

            {/* Error state */}
            {uploadStatus === 'error' && (
              <div className="relative z-10 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                ❌ {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col gap-4 relative z-10">
              <input
                className="input-field disabled:opacity-50"
                placeholder="Track title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                required
              />
              <input
                className="input-field disabled:opacity-50"
                placeholder="Artist name"
                value={uploadForm.artist}
                onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                required
              />
              <input
                className="input-field disabled:opacity-50"
                placeholder="Album name"
                value={uploadForm.album}
                onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                required
              />
              <select
                className="input-field disabled:opacity-50"
                value={uploadForm.genre}
                onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              >
                {['Electronic', 'Indie', 'Ambient', 'Pop', 'Hip-Hop', 'R&B', 'Post-Rock', 'Synthwave', 'Classical'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <label className="flex flex-col gap-2">
                <span className="text-xs text-zinc-400 uppercase tracking-widest">Audio File (Required)</span>
                <div className={`input-field cursor-pointer border-dashed text-zinc-500 text-sm flex items-center gap-2 ${
                  uploadStatus === 'uploading' || uploadStatus === 'processing' ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  <Upload className="w-4 h-4" />
                  <span className="truncate">{uploadForm.audioFile ? uploadForm.audioFile.name : 'Click to upload audio...'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="absolute opacity-0 w-0 h-0"
                    onChange={(e) => {
                      setUploadError('');
                      setUploadStatus('idle');
                      setUploadForm({ ...uploadForm, audioFile: e.target.files[0] });
                    }}
                    required
                  />
                </div>
              </label>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'processing' || uploadStatus === 'done'}
                  className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadStatus === 'uploading' || uploadStatus === 'processing'
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                    : uploadStatus === 'done'
                    ? '✅ Done!'
                    : <><Upload className="w-4 h-4" /> Upload Track</>}
                </button>
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                  className="btn-secondary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Song Modal */}
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
    </div>
  );
};

export default ArtistDashboard;
