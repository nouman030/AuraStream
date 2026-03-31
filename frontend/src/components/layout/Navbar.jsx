import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Music2, Menu, X, Search, Shield, Mic2, User, LogOut, ChevronDown, Play } from 'lucide-react';
import axiosInstance from '../../api/axios';

// ── SEARCH BAR component (reused for desktop + mobile) ──────────────────────
const SearchBar = ({ className = '', onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // On mount – focus input
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = (q) => {
    if (!q.trim()) { setResults([]); setShowDrop(false); return; }
    clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axiosInstance.get('/music/all-music');
        if (data.success) {
          const q_lower = q.toLowerCase();
          const filtered = data.musics
            .filter(m =>
              m.title?.toLowerCase().includes(q_lower) ||
              m.artist?.toLowerCase().includes(q_lower) ||
              m.genre?.toLowerCase().includes(q_lower) ||
              m.album?.toLowerCase().includes(q_lower)
            )
            .slice(0, 6);
          const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
          setResults(filtered.map((m, i) => ({
            id: m._id, title: m.title, artist: m.artist,
            genre: m.genre, album: m.album,
            coverColor: colors[i % colors.length],
            url: m.cloudinary_url,
            duration: m.duration ? `${Math.floor(m.duration / 60)}:${('0' + Math.floor(m.duration % 60)).slice(-2)}` : '0:00',
          })));
          setShowDrop(true);
        }
      } catch { /* silent */ }
      setLoading(false);
    }, 300);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDrop(false);
    navigate(`/music?q=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const handleResultClick = (song) => {
    setShowDrop(false);
    setQuery('');
    navigate(`/music?q=${encodeURIComponent(song.title)}`);
    onClose?.();
  };

  // Highlight matched text
  const highlight = (text, q) => {
    if (!q) return text;
    const idx = text?.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1 || !text) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-brand-violet/40 text-white rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none" />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-zinc-600 border-t-brand-violet rounded-full animate-spin" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => query && setShowDrop(true)}
        placeholder="Search songs, artists, genres..."
        className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-full py-2 pl-10 pr-9 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-violet/60 focus:ring-1 focus:ring-brand-violet/30 transition-all"
      />

      {/* Dropdown Results */}
      {showDrop && results.length > 0 && (
        <div
          ref={dropRef}
          className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-[200] shadow-2xl"
          style={{ background: 'rgba(12,12,18,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {results.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => handleResultClick(song)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left group"
            >
              <div
                className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-black text-sm relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${song.coverColor}cc, ${song.coverColor}44)` }}
              >
                <span className="opacity-40 text-sm">{song.title?.[0]}</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{highlight(song.title, query)}</p>
                <p className="text-zinc-500 text-xs truncate">{highlight(song.artist, query)} {song.genre && <span className="text-zinc-700">· {song.genre}</span>}</p>
              </div>
              <span className="text-zinc-700 text-xs font-mono flex-shrink-0">{song.duration}</span>
            </button>
          ))}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-brand-teal hover:bg-brand-teal/5 transition-colors border-t border-white/[0.05]"
          >
            <Search className="w-3 h-3" />
            See all results for "<span className="font-semibold">{query}</span>"
          </button>
        </div>
      )}

      {/* No results */}
      {showDrop && results.length === 0 && query.length > 1 && !loading && (
        <div
          ref={dropRef}
          className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-[200] px-4 py-4 text-center text-zinc-500 text-sm shadow-2xl"
          style={{ background: 'rgba(12,12,18,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          No results for "<span className="text-white">{query}</span>"
        </div>
      )}
    </form>
  );
};

// ── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/music', label: 'Browse' },
    { to: '/playlists', label: 'Playlists' },
  ];

  return (
    <>
      <nav
        className="fixed top-0 w-full h-16 z-50 flex items-center justify-between px-4 md:px-8"
        style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Left: Logo + hamburger */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 15px rgba(124,58,237,0.4)' }}
            >
              <Music2 className="text-white w-4 h-4" />
            </div>
            <span className="text-white font-black text-lg tracking-wide hidden sm:block font-heading">AuraStream</span>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <SearchBar />
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!user ? (
            <>
              <Link to="/auth" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors hidden sm:block">Log in</Link>
              <Link to="/auth" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white font-heading"
                  style={{
                    background: user.role === 'ADMIN'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : user.role === 'ARTIST'
                      ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                      : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    boxShadow: `0 0 10px ${user.role === 'ADMIN' ? '#f59e0b' : user.role === 'ARTIST' ? '#7c3aed' : '#06b6d4'}44`,
                  }}
                >
                  {user.name?.[0]}
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
                  style={{ background: 'rgba(15,15,20,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-zinc-500 text-xs">{user.email}</p>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04] transition-colors">
                      <Shield className="w-4 h-4 text-brand-gold" /> Admin Panel
                    </Link>
                  )}
                  {user.role === 'ARTIST' && (
                    <Link to="/artist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04] transition-colors">
                      <Mic2 className="w-4 h-4 text-brand-violet" /> Artist Studio
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04] transition-colors">
                    <User className="w-4 h-4 text-zinc-400" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors border-t border-white/[0.06]"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="h-auto w-full py-4 px-4 flex flex-col gap-2"
            style={{ background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(20px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Mobile */}
            <div className="mb-3">
              <SearchBar onClose={() => setMobileMenuOpen(false)} />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-brand-violet/20 text-brand-violet'
                    : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/[0.04]">
                Admin Panel
              </Link>
            )}
            {user?.role === 'ARTIST' && (
              <Link to="/artist" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/[0.04]">
                Artist Studio
              </Link>
            )}

            {!user && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-secondary flex-1 text-center text-sm py-2">Log in</Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">Sign Up</Link>
              </div>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="mt-2 pt-2 border-t border-white/[0.06] text-sm text-red-400 text-left px-4 py-3 rounded-xl hover:bg-red-400/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
