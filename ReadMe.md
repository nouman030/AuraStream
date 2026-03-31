<h1 align="center">
  <br>
  🎵 AuraStream
  <br>
</h1>

<h4 align="center">A full-stack, dark-luxury music streaming platform built with React and Node.js.</h4>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img alt="Cloudinary" src="https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-roles--permissions">Roles</a>
</p>

---

## ✨ Features

- 🎧 **Global Persistent Music Player** — Plays audio across all pages without interruption
- 🏠 **Dynamic Home Page** — Featured songs, trending tracks, and 3D Three.js visualizations
- 🔍 **Music Browse & Search** — Filter and discover songs by genre, artist, or title
- 📋 **Playlist Management** — Create, update, and delete personal playlists; add/remove tracks
- 👤 **Role-Based Access Control** — Three distinct roles: `user`, `artist`, and `admin`
- 🎨 **Artist Dashboard** — Upload music with Cloudinary, manage your own catalogue
- 🛡️ **Admin Dashboard** — Full control over users, songs, and platform content
- 🔐 **JWT Authentication** — Secure login/register with HttpOnly cookie sessions
- ☁️ **Cloudinary Integration** — Audio and media files stored and streamed via Cloudinary
- 📱 **Fully Responsive** — Optimized layout for desktop, tablet, and mobile

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **React Router DOM v7** | Client-side routing |
| **Vite** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Three.js** | 3D audio visualizations |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Express 5** | Web server framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JSON Web Tokens (JWT)** | Authentication |
| **Bcrypt** | Password hashing |
| **Multer + Cloudinary** | File upload & cloud storage |
| **Cookie Parser** | Secure cookie management |
| **CORS** | Cross-origin request handling |

---

## 📁 Project Structure

```
auraStream/
├── backend/
│   ├── server.js               # Entry point
│   ├── .env.example            # Environment variable template
│   └── src/
│       ├── app.js              # Express app setup & middleware
│       ├── config/
│       │   └── cloudinary.js   # Cloudinary & Multer config
│       ├── controllers/        # Request handlers
│       │   ├── auth.controller.js
│       │   ├── music.controller.js
│       │   └── playlist.controller.js
│       ├── db/                 # Database connection
│       ├── middlewares/
│       │   └── auth.middleware.js  # JWT verify & role guard
│       ├── models/
│       │   ├── user.model.js
│       │   ├── music.model.js
│       │   └── playlist.model.js
│       ├── routers/
│       │   ├── auth.route.js
│       │   ├── music.route.js
│       │   └── playlist.route.js
│       └── services/           # Business logic layer
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Root component & routing
        ├── main.jsx
        ├── api/                # Axios API service layer
        ├── components/
        │   ├── layout/         # Navbar, Sidebar
        │   └── player/         # Global MusicPlayer
        ├── context/
        │   ├── AuthContext.jsx # Global auth state
        │   └── PlayerContext.jsx # Global player state
        ├── pages/
        │   ├── Home.jsx
        │   ├── MusicBrowse.jsx
        │   ├── SongDetail.jsx
        │   ├── Playlists.jsx
        │   ├── PlaylistDetail.jsx
        │   ├── Auth.jsx
        │   ├── Profile.jsx
        │   ├── ArtistDashboard.jsx
        │   └── AdminDashboard.jsx
        └── data/               # Static/fallback data
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Cloudinary](https://cloudinary.com/) account (for media uploads)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/auraStream.git
cd auraStream
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/aurastream
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:8000`.

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

### 🔐 Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login and receive JWT cookie |
| `GET` | `/logout` | Public | Clear session cookie |
| `GET` | `/current-user` | 🔒 Token | Get the logged-in user's profile |
| `PUT` | `/update-profile` | 🔒 Token | Update profile information |
| `GET` | `/all-users` | 🔒 Admin | List all registered users |
| `DELETE` | `/remove-user/:id` | 🔒 Admin | Delete a user by ID |

---

### 🎵 Music — `/api/v1/music`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/all-music` | Public | Fetch all songs |
| `GET` | `/:id` | Public | Get a single song by ID |
| `POST` | `/upload` | 🔒 Artist/Admin | Upload a new song (with audio file) |
| `PUT` | `/:id` | 🔒 Artist/Admin | Update song metadata |
| `DELETE` | `/:id` | 🔒 Artist/Admin | Delete a song |

---

### 📋 Playlists — `/api/v1/playlist`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/all-playlists` | Public | Get all public playlists |
| `GET` | `/my-playlists` | 🔒 Token | Get the current user's playlists |
| `GET` | `/playlist/:id` | 🔒 Token | Get a specific playlist |
| `POST` | `/create` | 🔒 Token | Create a new playlist |
| `PUT` | `/playlist/:id` | 🔒 Token | Update a playlist |
| `DELETE` | `/playlist/:id` | 🔒 Token | Delete a playlist |
| `POST` | `/playlist/:id/add-song` | 🔒 Token | Add a song to a playlist |
| `DELETE` | `/playlist/:id/remove-song` | 🔒 Token | Remove a song from a playlist |

---

## 👥 Roles & Permissions

AuraStream uses a three-tier role system:

| Role | Permissions |
|------|-------------|
| **User** | Browse music, manage personal playlists, update profile |
| **Artist** | All user permissions + upload, edit & delete own songs |
| **Admin** | Full platform control: manage all users, songs, and content |

---

## 🔒 Environment Variables Summary

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | Backend | Server port (default: 8000) |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret key for signing JWTs |
| `CORS_ORIGIN` | Backend | Allowed frontend origin |
| `CLOUD_NAME` | Backend | Cloudinary cloud name |
| `API_KEY` | Backend | Cloudinary API key |
| `API_SECRET` | Backend | Cloudinary API secret |
| `VITE_API_URL` | Frontend | Backend API base URL |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">Made with ❤️ and lots of 🎵</p>
