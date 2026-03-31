import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed! Server not started.", error);
        process.exit(1);
    });