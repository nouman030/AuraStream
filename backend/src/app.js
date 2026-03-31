import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.route.js";
import musicRouter from "./routers/music.route.js";
import playlistRouter from "./routers/playlist.route.js";
const app = express();

app.use(cors({
    origin: true, // Dynamically mirror the request origin (fixes Vercel CORS issues instantly)
    credentials: true // Crucial for allowing cookies to be set across origins
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/music", musicRouter);
app.use("/api/v1/playlist", playlistRouter);
export default app;
