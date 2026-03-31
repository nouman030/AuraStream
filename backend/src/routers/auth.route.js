import {Router} from "express";
import {registerUser, loginUser, removeUser, logoutUser, getCurrentUser, getAllUsers, updateProfile} from "../controllers/auth.controller.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

//register and login (auth)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

// User retrieval endpoints
router.get('/current-user', verifyToken, getCurrentUser);
router.get('/all-users', verifyToken, verifyRole("admin"), getAllUsers);
router.put('/update-profile', verifyToken, updateProfile);
//delete
router.delete("/remove-user/:id", verifyToken, verifyRole("admin"), removeUser);

export default router;