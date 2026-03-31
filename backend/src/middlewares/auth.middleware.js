import AuthServices from "../services/auth.service.js";
import UserServices from "../services/user.service.js";

export const verifyToken = async (req, res, next) => {
    try {
        // Support token in both cookies and Authorization header
        let token = req.cookies?.token;
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided. Please log in." });
        }

        // Verify the JWT token
        const decoded = await AuthServices.verifyJwtToken(token);
        
        // Fetch complete active user to ensure role validity and existence
        const user = await UserServices.getCurrentUser(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "User no longer exists. Please log in again." });
        }
        
        // Attach user to the request
        req.user = user;
        
        next();
    } catch (error) {
        console.error("Authentication middleware error:", error.message);
        return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    }
};

export const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Access denied. Insufficient permissions." });
        }
        
        const hasRole = Array.isArray(roles) 
            ? roles.includes(req.user.role) 
            : req.user.role === roles;

        if (!hasRole) {
            return res.status(403).json({ error: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
