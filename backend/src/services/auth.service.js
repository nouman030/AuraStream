import jwt from "jsonwebtoken";

class AuthServices {
    /**
     * Generates a JWT token for a given user ID
     * @param {string|mongoose.Types.ObjectId} userId - The unique identifier of the user
     * @returns {string} The generated JWT token
     */
    async generateJwtToken(userId) {
        try {
            if (!userId) {
                throw new Error("User ID is required to generate a token");
            }

            // Standard object payload (more secure and expandable than string payload)
            const payload = {
                id: userId
            };
            
            // Use environment variable for secret, with a fallback
            const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
            
            // Options for token signing
            const options = {
                expiresIn: process.env.JWT_EXPIRES_IN || '3d'
            };

            // Sign the token
            const token = jwt.sign(payload, secret, options);
            return token;
            
        } catch (error) {
            console.error('Error in generateJwtToken:', error.message);
            throw new Error(`Failed to generate token: ${error.message}`);
        }
    }

    /**
     * Verifies a given JWT token
     * @param {string} token - The auth token to verify
     * @returns {Object} The decoded payload
     */
    async verifyJwtToken(token) {
        try {
            if (!token) {
                throw new Error("Token is required for verification");
            }

            const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
            
            // Verify and return the payload 
            const decodedPayload = jwt.verify(token, secret);
            return decodedPayload;
            
        } catch (error) {
            console.error('Error in verifyJwtToken:', error.message);
            throw new Error(`Invalid or expired token: ${error.message}`);
        }
    }
}

export default new AuthServices(); 