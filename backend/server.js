import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB();

if (process.env.NODE_ENV !== "production") {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
}

// Export the Express API for Vercel serverless functions
export default app;