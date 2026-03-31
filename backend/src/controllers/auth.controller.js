import UserServices from "../services/user.service.js";
import AuthServices from "../services/auth.service.js";
import bcrypt from "bcrypt";

// Cookie options to easily reuse across register and login
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Must be false for local HTTP development
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allows cookies across ports in local dev
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

export const registerUser = async (req, res) => {
    try {
        const { username, email, password , role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Please provide a username, email, and password." });
        }
        if (username.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters long." });
        }
        if (username.includes(" ")) {
            return res.status(400).json({ error: "Username cannot contain spaces." });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Please provide a valid email address." });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserServices.registerUser({ 
            username, 
            email, 
            password: hashedPassword ,
            role: role || "user"
        });

        const token = await AuthServices.generateJwtToken(user._id);

        // Send token as cookie on registration as well
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({ 
            message: "Registration successful!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email, 
                role: user.role
            }, 
            token 
        });

    } catch (error) {
        console.error("Error during user registration:", error);
        
        if (error.code === 11000) {
            return res.status(409).json({ error: "Username or email is already taken. Please try another one." });
        }

        return res.status(500).json({ error: "An internal server error occurred. Please try again later." });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Validate inputs
        if (!password) {
            return res.status(400).json({ error: "Password is required for login." });
        }
        if (!username && !email) {
            return res.status(400).json({ error: "Please provide either a username or an email to log in." });
        }

        // 2. Find the user
        const user = await UserServices.loginUser({ username, email });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials. User not found." });
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials. Incorrect password." });
        }
        
        // 4. Generate token
        const token = await AuthServices.generateJwtToken(user._id);

        // 5. Send cookie
        res.cookie("token", token, cookieOptions);

        // 6. Return success response
        return res.status(200).json({ 
            message: "Login successful!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }, 
            token 
        });

    } catch (error) {
        console.error("Error during user login:", error);
        return res.status(500).json({ error: "An internal server error occurred during login." });
    }
};

export const logoutUser = async (req, res) => {
    try {
         res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        
        return res.status(200).json({ message: "User logged out successfully!" });
    } catch (error) {
        console.error("Error during user logout:", error);
        return res.status(500).json({ error: "An internal server error occurred during user logout." });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        // req.user was securely injected by our verifyToken middleware!
        const user = await UserServices.getCurrentUser(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: "User profile could not be found." });
        }
        
        return res.status(200).json({ 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error during user fetch:", error);
        return res.status(500).json({ error: "An internal server error occurred during user fetch." });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserServices.getAllUsers();
        return res.status(200).json({ users });
    } catch (error) {
        console.error("Error during fetching all users:", error);
        return res.status(500).json({ error: "An internal server error occurred while retrieving user data." });
    }
};

// export const makeAdmin = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await UserServices.makeAdmin(id);
//         return res.status(200).json({ message: "User made admin successfully!", user });
//     } catch (error) {
//         console.error("Error during user promotion:", error);
//         return res.status(500).json({ error: "An internal server error occurred during user promotion." });
//     }
// };

export const updateProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const { username, email, role } = req.body;
        const user = await UserServices.updateProfile(id, { username, email, role });
        return res.status(200).json({ message: "User profile updated successfully!", user });
    } catch (error) {
        console.error("Error during user profile update:", error);
        return res.status(500).json({ error: "An internal server error occurred during user profile update." });
    }
};


export const changePassword = async (req, res) => {
    try {
        const id = req.user.id;
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserServices.changePassword(id, hashedPassword);
        return res.status(200).json({ message: "Password changed successfully!", user });
    } catch (error) {
        console.error("Error during password change:", error);
        return res.status(500).json({ error: "An internal server error occurred during password change." });
    }
};

export const removeUser = async (req, res) => {
    try {
       const  id  = req.params.id;
        const user = await UserServices.deleteUser(id);
        res.clearCookie("token");
        return res.status(200).json({ message: "User removed successfully!", user });
    } catch (error) {
        console.error("Error during user removal:", error);
        return res.status(500).json({ error: "An internal server error occurred during user removal." });
    }
};