import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ListMusic, Library, PlusSquare, TrendingUp, Heart, Clock, Shield, Mic2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

const Sidebar = ({ className = "" }) => {
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      const fetchMyPlaylists = async () => {
        try {
          const { data } = await axiosInstance.get('/playlist/my-playlists');
          if (data.success) {
            const mapped = data.playlists.map(pl => ({
              id: pl._id,
              name: pl.name,
              songs: pl.musics?.length || 0,
              colors: ['#7c3aed', '#06b6d4'] // default gradient colors
            }));
            setMyPlaylists(mapped.slice(0, 3));
          }
        } catch (error) {
          console.error("Error fetching my playlists:", error);
        }
      };
      fetchMyPlaylists();
    } else {
      setMyPlaylists([]);
    }
  }, [user]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
      isActive
        ? 'text-white bg-brand-violet/20 shadow-[inset_2px_0_0_#7c3aed]'
        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  return (
    <aside
      className={`flex flex-col py-6 ${className}`}
      style={{ background: 'rgba(10,10,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Nav section */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3 px-3">Menu</p>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            <Home className="w-4 h-4 flex-shrink-0" /> Home
          </NavLink>
          <NavLink to="/music" className={linkClass}>
            <Compass className="w-4 h-4 flex-shrink-0" /> Browse
          </NavLink>
          <NavLink to="/playlists" className={linkClass}>
            <ListMusic className="w-4 h-4 flex-shrink-0" /> Playlists
          </NavLink>
          <NavLink to="/music" className={linkClass}>
            <TrendingUp className="w-4 h-4 flex-shrink-0" /> Charts
          </NavLink>
          
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={linkClass}>
              <Shield className="w-4 h-4 flex-shrink-0 text-brand-gold" /> Admin Panel
            </NavLink>
          )}
          {user?.role === 'ARTIST' && (
            <NavLink to="/artist" className={linkClass}>
              <Mic2 className="w-4 h-4 flex-shrink-0 text-brand-violet" /> Artist Studio
            </NavLink>
          )}
        </nav>
      </div>

      {user && (
        <div className="px-4 mb-6">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3 px-3">Library</p>
          <nav className="flex flex-col gap-1">
            <NavLink to="/playlists" className={linkClass}>
              <Library className="w-4 h-4 flex-shrink-0" /> My Playlists
            </NavLink>
            <NavLink to="/music" className={linkClass}>
              <Heart className="w-4 h-4 flex-shrink-0" /> Liked Songs
            </NavLink>
            <NavLink to="/music" className={linkClass}>
              <Clock className="w-4 h-4 flex-shrink-0" /> Recently Played
            </NavLink>
          </nav>
        </div>
      )}

      {/* Create playlist */}
      {user && (
        <div className="px-4 mb-6">
          <NavLink to="/playlists" className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-brand-teal transition-colors px-3 py-2">
            <PlusSquare className="w-4 h-4 flex-shrink-0 text-brand-teal" /> Create Playlist
          </NavLink>
        </div>
      )}

      {/* My Playlists list */}
      {myPlaylists.length > 0 && (
        <div className="px-4 flex-1 overflow-hidden">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3 px-3">Recent Playlists</p>
          <div className="flex flex-col gap-1">
            {myPlaylists.map((pl) => (
              <NavLink
                key={pl.id}
                to={`/playlists/${pl.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive ? 'text-white bg-brand-violet/10' : 'hover:bg-white/[0.03]'}`
                }
              >
                <div
                  className="w-8 h-8 rounded flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${pl.colors[0]}, ${pl.colors[1]})` }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-300 group-hover:text-white truncate">{pl.name}</p>
                  <p className="text-xs text-zinc-600 truncate">{pl.songs} songs</p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Decorative gradient */}
      <div className="mt-auto px-4 pb-2 relative overflow-hidden">
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-violet/15 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-4 right-0 w-24 h-24 bg-brand-teal/10 rounded-full blur-[50px] pointer-events-none" />
      </div>
    </aside>
  );
};

export default Sidebar;
