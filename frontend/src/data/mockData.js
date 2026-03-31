// Mock data for the application UI development
// Replace API calls in components with these when backend is not connected

export const MOCK_SONGS = [
  { id: 1, title: "Neon Requiem", artist: "Violet Surge", duration: "3:47", genre: "Electronic", coverColor: "#7c3aed", plays: 128400 },
  { id: 2, title: "Gilded Horizon", artist: "Aurelia Banks", duration: "4:12", genre: "Indie", coverColor: "#f59e0b", plays: 89200 },
  { id: 3, title: "Crystal Depths", artist: "The Tessera", duration: "5:03", genre: "Ambient", coverColor: "#06b6d4", plays: 214000 },
  { id: 4, title: "Molten Pulse", artist: "Kira Von", duration: "3:28", genre: "Pop", coverColor: "#ec4899", plays: 56700 },
  { id: 5, title: "Shadow Protocol", artist: "DarkHound", duration: "4:55", genre: "Hip-Hop", coverColor: "#10b981", plays: 301000 },
  { id: 6, title: "Starless City", artist: "Elara Muse", duration: "3:15", genre: "R&B", coverColor: "#f97316", plays: 147800 },
  { id: 7, title: "Lunar Forge", artist: "Cerium", duration: "6:22", genre: "Post-Rock", coverColor: "#8b5cf6", plays: 42100 },
  { id: 8, title: "Thunder Glass", artist: "Mira Cross", duration: "3:58", genre: "Synthwave", coverColor: "#14b8a6", plays: 186000 },
  { id: 9, title: "Phantom Waltz", artist: "Aurelia Banks", duration: "4:33", genre: "Classical", coverColor: "#a78bfa", plays: 99300 },
  { id: 10, title: "Digital Mirage", artist: "Violet Surge", duration: "5:17", genre: "Electronic", coverColor: "#06b6d4", plays: 175000 },
  { id: 11, title: "Golden Ashes", artist: "Kira Von", duration: "3:42", genre: "Pop", coverColor: "#fbbf24", plays: 261000 },
  { id: 12, title: "Echo Chamber", artist: "The Tessera", duration: "4:08", genre: "Indie", coverColor: "#34d399", plays: 77400 },
];

export const MOCK_ARTISTS = [
  { id: 1, name: "Violet Surge", genre: "Electronic / Ambient", followers: "2.4M", color: "#7c3aed" },
  { id: 2, name: "Aurelia Banks", genre: "Indie / Classical", followers: "890K", color: "#f59e0b" },
  { id: 3, name: "The Tessera", genre: "Ambient / Post-Rock", followers: "1.1M", color: "#06b6d4" },
  { id: 4, name: "Kira Von", genre: "Pop / Electronic", followers: "4.2M", color: "#ec4899" },
  { id: 5, name: "DarkHound", genre: "Hip-Hop / Trap", followers: "3.6M", color: "#10b981" },
  { id: 6, name: "Elara Muse", genre: "R&B / Soul", followers: "1.8M", color: "#f97316" },
];

export const MOCK_PLAYLISTS = [
  { id: 1, name: "Deep Focus", description: "Concentrate and flow", songs: 24, isPublic: true, owner: "System", colors: ["#7c3aed", "#06b6d4"] },
  { id: 2, name: "Late Night Drive", description: "For the 3am rides", songs: 18, isPublic: true, owner: "Neon Atlas", colors: ["#0a0a0f", "#f59e0b"] },
  { id: 3, name: "Euphoria Mode", description: "Peak energy vibes", songs: 31, isPublic: true, owner: "Violet Surge", colors: ["#ec4899", "#7c3aed"] },
  { id: 4, name: "Ocean State", description: "Blue-hour ambience", songs: 12, isPublic: false, owner: "Guest", colors: ["#06b6d4", "#0ea5e9"] },
  { id: 5, name: "Golden Archive", description: "The classics, remastered soul", songs: 40, isPublic: true, owner: "Aurelia Banks", colors: ["#f59e0b", "#f97316"] },
  { id: 6, name: "Void Protocol", description: "Industrial darkness", songs: 15, isPublic: true, owner: "DarkHound", colors: ["#111", "#6b7280"] },
];

export const MOCK_USERS = [
  { id: 1, name: "Admin Root", email: "admin@aura.fm", role: "ADMIN", joined: "Jan 2025" },
  { id: 2, name: "Violet Surge", email: "vs@aura.fm", role: "ARTIST", joined: "Feb 2025" },
  { id: 3, name: "Aurelia Banks", email: "aurelia@aura.fm", role: "ARTIST", joined: "Feb 2025" },
  { id: 4, name: "Marcus V", email: "marcusv@aura.fm", role: "USER", joined: "Mar 2025" },
  { id: 5, name: "Lena Cross", email: "lenac@aura.fm", role: "USER", joined: "Mar 2025" },
  { id: 6, name: "DarkHound", email: "dark@aura.fm", role: "ARTIST", joined: "Mar 2025" },
];

export const MOCK_STATS = {
  totalUsers: 1204,
  totalSongs: 8432,
  totalArtists: 312,
  totalPlaylists: 5190,
};
