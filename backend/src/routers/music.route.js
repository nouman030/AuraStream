import { Router } from "express";
import { uploadMusic, getAllMusic, getMusicById, updateMusic, deleteMusic } from "../controllers/music.controller.js";
import { upload } from "../config/cloudinary.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/upload", verifyToken,upload.single("audio"), verifyRole(["admin", "artist"]),uploadMusic);
router.get("/all-music", getAllMusic);
router.get("/:id", getMusicById);
router.put("/:id", verifyToken,verifyRole(["admin", "artist"]), updateMusic);
router.delete("/:id", verifyToken, verifyRole(["admin", "artist"]),deleteMusic);

export default router;