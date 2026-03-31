import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MusicPlayer from './components/player/MusicPlayer';

import Home from './pages/Home';
import MusicBrowse from './pages/MusicBrowse';
import SongDetail from './pages/SongDetail';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import ArtistDashboard from './pages/ArtistDashboard';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center text-brand-violet">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;

  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return <Navigate to="/" />; // Not authorized
  }

  return children;
};

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-base relative">
      <Navbar />
      <div className="flex flex-1 pt-16 pb-24">
        <Sidebar className="hidden md:flex w-64 fixed left-0 top-16 bottom-24 overflow-y-auto" />
        <main className="flex-1 md:ml-64 w-full p-4 md:p-8 overflow-y-auto min-h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/music" element={<MusicBrowse />} />
            <Route path="/music/:id" element={<SongDetail />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/artist/*" element={
              <ProtectedRoute requiredRole="ARTIST"><ArtistDashboard /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <AppLayout />
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
