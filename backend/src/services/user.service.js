import { User } from "../models/user.model.js";

class UserServices {
    async registerUser(userData) {
        const { username, email, password , role} = userData;
        const user = await User.create({ username, email, password , role});
        return user;
    }


    async loginUser({ username, email }) {
        const conditions = [];
        if (username) conditions.push({ username });
        if (email) conditions.push({ email });

        // If neither is provided, return null
        if (conditions.length === 0) return null;

        const user = await User.findOne({ $or: conditions });
        return user;
    }

   
    async getAllUsers() {
        // Find all users and return them (excluding passwords)
        const users = await User.find({}, { password: 0 });
        return users;
    }

    async getCurrentUser(userId) {
        const user = await User.findById(userId);
        return user;
    }
    
    async updateProfile(userId, userData) {
        const user = await User.findByIdAndUpdate(userId, userData, { new: true });
        return user;
    }

    async changePassword(userId, password) {
        const user = await User.findByIdAndUpdate(userId, { password }, { new: true });
        return user;
    }

    async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);
        return user;
    }
}

export default new UserServices();
