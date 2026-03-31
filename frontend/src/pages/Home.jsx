import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, ChevronRight, Loader, Headphones, Music2, Disc3 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import axiosInstance from '../api/axios';

// Lazy-load Three.js components for performance
const VinylRecord = lazy(() => import('../components/three/VinylRecord'));
const AudioWaveform = lazy(() => import('../components/three/AudioWaveform'));
const GeometricOrb = lazy(() => import('../components/three/GeometricOrb'));

// ── SONG CARD ─────────────────────────────────────────────────────────────────
const SongCard = ({ song, onPlay, isPlaying, isActive }) => (
  <div
    className={`glass-card noise-overlay p-3 sm:p-4 flex gap-3 sm:gap-4 items-center cursor-pointer group transition-all duration-300 ${
      isActive ? 'ring-1 ring-brand-violet shadow-[0_0_20px_rgba(124,58,237,0.25)] -translate-y-0.5' : 'hover:-translate-y-0.5'
    }`}
    onClick={() => onPlay(song)}
  >
    {/* Cover */}
    <div
      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${song.coverColor}cc, ${song.coverColor}44)` }}
    >
      <span className="opacity-30 text-2xl font-black">{song.title[0]}</span>
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {isActive && isPlaying
          ? <div className="flex items-end gap-0.5 h-4">{[1,2,3].map(b => <div key={b} className="w-0.5 bg-white rounded-sm animate-pulse" style={{ height: `${b * 33}%` }} />)}</div>
          : <Play className="w-4 h-4 fill-white text-white" />
        }
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className={`font-semibold text-sm truncate transition-colors ${isActive ? 'text-brand-violet' : 'text-white group-hover:text-brand-teal'}`}>{song.title}</h4>
      <p className="text-zinc-400 text-xs truncate mt-0.5">{song.artist}</p>
    </div>
    <span className="text-zinc-600 text-xs font-mono flex-shrink-0 hidden sm:block">{song.duration}</span>
  </div>
);

// ── ARTIST CARD ───────────────────────────────────────────────────────────────
const ArtistCard = ({ artist }) => (
  <div className="glass-card noise-overlay p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-1.5 transition-all duration-300">
    <div
      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full mb-3 flex items-center justify-center text-white font-black text-xl sm:text-2xl font-heading group-hover:scale-110 transition-all duration-300 shadow-xl"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${artist.color}ee, ${artist.color}55)`,
        boxShadow: `0 8px 32px ${artist.color}40`
      }}
    >
      {artist.name[0]}
    </div>
    <h3 className="text-white font-bold text-xs sm:text-sm mb-0.5 truncate w-full">{artist.name}</h3>
    <p className="text-zinc-500 text-xs mb-1.5 truncate w-full">{artist.genre}</p>
    <div
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ color: artist.color, background: `${artist.color}18`, border: `1px solid ${artist.color}30` }}
    >
      {artist.followers}
    </div>
  </div>
);

// ── PLAYLIST CARD ─────────────────────────────────────────────────────────────
const PlaylistCard = ({ playlist }) => (
  <Link to={`/playlists/${playlist.id}`}>
    <div className="glass-card noise-overlay overflow-hidden cursor-pointer group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
      <div className="h-28 sm:h-32 relative" style={{ background: `linear-gradient(135deg, ${playlist.colors[0]}, ${playlist.colors[1]})` }}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/60"
              style={{ width: `${(i+1)*20}%`, height: `${(i+1)*20}%`, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Music2 className="w-16 h-16 text-white" />
        </div>
        {/* Hover play */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <Play className="w-4 h-4 fill-zinc-900 text-zinc-900 ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-white font-bold text-xs sm:text-sm mb-0.5 truncate">{playlist.name}</h3>
        <p className="text-zinc-400 text-xs truncate">{playlist.description}</p>
        <p className="text-zinc-600 text-xs mt-1">{playlist.songs} songs · {playlist.owner}</p>
      </div>
    </div>
  </Link>
);

// ── SECTION HEADER ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, linkTo, orbSlot }) => (
  <div className="flex items-center justify-between mb-5 sm:mb-6">
    <div className="flex items-center gap-3">
      <h2 className="text-xl sm:text-2xl font-black font-heading text-white">{title}</h2>
      {orbSlot}
    </div>
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-xs sm:text-sm text-zinc-400 hover:text-brand-teal transition-colors group">
        See all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    )}
  </div>
);

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message, linkTo, linkLabel }) => (
  <div className="col-span-full py-10 flex flex-col items-center gap-3 text-zinc-600">
    <Icon className="w-10 h-10 opacity-30" />
    <p className="text-sm">{message}</p>
    {linkTo && <Link to={linkTo} className="btn-primary text-xs py-2 px-4">{linkLabel}</Link>}
  </div>
);

// ── HOME PAGE ──────────────────────────────────────────────────────────────────
const Home = () => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: musicData }, { data: playlistData }] = await Promise.all([
        axiosInstance.get('/music/all-music'),
        axiosInstance.get('/playlist/all-playlists')
      ]);

      const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];

      if (musicData.success) {
        const mappedSongs = musicData.musics.map((m, i) => ({
          id: m._id, title: m.title, artist: m.artist,
          duration: m.duration ? `${Math.floor(m.duration / 60)}:${('0' + Math.floor(m.duration % 60)).slice(-2)}` : '0:00',
          coverColor: colors[i % colors.length],
          url: m.cloudinary_url
        }));
        setFeaturedSongs(mappedSongs.slice(0, 6));
        setTrendingSongs(mappedSongs.slice(6, 12));

        const uniqueArtistsMap = new Map();
        musicData.musics.forEach(m => {
          if (!uniqueArtistsMap.has(m.artist)) {
            uniqueArtistsMap.set(m.artist, {
              id: m.artist, name: m.artist, genre: m.genre || 'Artist',
              followers: Math.floor(Math.random() * 900 + 100) + 'K',
              color: colors[uniqueArtistsMap.size % colors.length]
            });
          }
        });
        setArtists(Array.from(uniqueArtistsMap.values()).slice(0, 6));
      }

      if (playlistData.success) {
        setPlaylists(playlistData.playlists.slice(0, 6).map((p, i) => ({
          id: p._id, name: p.name, description: p.description,
          songs: p.musics?.length || 0,
          owner: p.user?.username || p.user?.name || 'AuraStream',
          colors: [colors[i % colors.length], colors[(i + 1) % colors.length]]
        })));
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-[65vh] flex flex-col items-center justify-center gap-5">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-brand-violet/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-violet animate-spin" />
          <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-brand-teal animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-zinc-400 font-medium text-sm tracking-wide">Loading AuraStream Edition...</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">

      {/* ── HERO SECTION ──────────────────────────────── */}
      <section className="relative overflow-hidden mb-12 sm:mb-16 rounded-2xl glass-card noise-overlay min-h-[400px] sm:min-h-[460px] flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-12 sm:py-16">
        {/* Animated bg mesh */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-brand-violet/18 blur-[120px]" style={{ animation: 'float 8s ease-in-out infinite' }} />
          <div className="absolute bottom-[-25%] right-[-10%] w-[400px] h-[400px] rounded-full bg-brand-teal/15 blur-[100px]" style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '3s' }} />
          <div className="absolute top-[30%] right-[20%] w-[250px] h-[250px] rounded-full bg-brand-gold/10 blur-[80px]" style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '1.5s' }} />
          <Suspense fallback={null}><AudioWaveform /></Suspense>
        </div>

        {/* Left — Copy */}
        <div className="relative z-10 md:w-1/2 mb-10 md:mb-0 fade-in stagger-1">
          <div className="inline-flex items-center gap-2 bg-brand-violet/15 border border-brand-violet/30 rounded-full px-4 py-1.5 text-xs text-brand-violet font-semibold mb-5 backdrop-blur-sm">
            <TrendingUp className="w-3 h-3" /> Now Streaming: Dark Luxury Edition
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-heading text-white mb-4 sm:mb-5 leading-[0.9]">
            Discover<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 50%, #f59e0b 100%)' }}
            >
              AuraStream
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 mb-7 sm:mb-8 max-w-sm sm:max-w-md leading-relaxed">
            Immerse yourself in a luxurious auditory experience where next-generation sound meets generative art.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link to="/music" className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base">
              <Play className="w-4 h-4 fill-white" /> Start Listening
            </Link>
            <Link to="/playlists" className="btn-secondary inline-flex items-center gap-2 text-sm sm:text-base">
              <Headphones className="w-4 h-4" /> Explore Playlists
            </Link>
          </div>
          {/* Quick stats row */}
          <div className="flex gap-5 mt-8 pt-6 border-t border-white/5">
            {[
              { label: 'Live Tracks', value: featuredSongs.length + trendingSongs.length, color: '#7c3aed' },
              { label: 'Playlists', value: playlists.length, color: '#06b6d4' },
              { label: 'Artists', value: artists.length, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl sm:text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-zinc-600 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — 3D Vinyl */}
        <div className="relative z-10 md:w-1/2 flex items-center justify-center fade-in stagger-2">
          <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px]">
            <Suspense fallback={<div className="w-full h-full rounded-full bg-brand-violet/10 animate-pulse" />}>
              <VinylRecord />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── FEATURED TRACKS ───────────────────────────── */}
      {featuredSongs.length > 0 && (
        <section className="mb-12 fade-in stagger-2">
          <SectionHeader title="Featured Tracks" linkTo="/music" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
            {featuredSongs.map((song, i) => (
              <div key={song.id} className={`fade-in stagger-${Math.min(i + 1, 4)}`}>
                <SongCard
                  song={song}
                  onPlay={playSong}
                  isActive={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TRENDING NOW ───────────────────────────────── */}
      {trendingSongs.length > 0 && (
        <section className="mb-12 fade-in">
          <SectionHeader title="Trending Now" linkTo="/music" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {trendingSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className={`glass-card noise-overlay p-3 sm:p-4 flex flex-col cursor-pointer group hover:-translate-y-1.5 transition-all duration-300 ${
                  currentSong?.id === song.id ? 'ring-1 ring-brand-teal shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''
                }`}
              >
                <div
                  className="aspect-square rounded-xl mb-2.5 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${song.coverColor}99, ${song.coverColor}22)` }}
                >
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-black text-white opacity-15 font-heading select-none">
                    {song.title[0]}
                  </span>
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/35 ${
                    currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {currentSong?.id === song.id && isPlaying
                      ? <div className="flex items-end gap-0.5 h-5">{[1,2,3].map(b => <div key={b} className="w-1 bg-white rounded-sm animate-pulse" style={{ height: `${b * 33}%` }} />)}</div>
                      : <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
                    }
                  </div>
                </div>
                <h4 className={`text-xs font-bold truncate ${currentSong?.id === song.id ? 'text-brand-teal' : 'text-white'}`}>{song.title}</h4>
                <p className="text-zinc-500 text-xs truncate mt-0.5">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED ARTISTS ──────────────────────────── */}
      <section className="mb-12 fade-in">
        <SectionHeader
          title="Featured Artists"
          orbSlot={
            <Suspense fallback={null}>
              <GeometricOrb />
            </Suspense>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {artists.length > 0
            ? artists.map(a => <ArtistCard key={a.id} artist={a} />)
            : <EmptyState icon={Headphones} message="No artists yet — upload some music!" linkTo="/auth" linkLabel="Get Started" />
          }
        </div>
      </section>

      {/* ── CURATED PLAYLISTS ─────────────────────────── */}
      <section className="mb-12 fade-in">
        <SectionHeader title="Curated Playlists" linkTo="/playlists" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {playlists.length > 0
            ? playlists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)
            : <EmptyState icon={Disc3} message="No public playlists yet." linkTo="/playlists" linkLabel="Create One" />
          }
        </div>
      </section>

    </div>
  );
};

export default Home;
