
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
import app from "./app.js";
import "./config/passport.config.js"; // Ensure passport is configured




connectDB()
    .then(() => {
        // app.listen(process.env.PORT || 8000,()=>{
        //     console.log(`☸️ Server is running on port ${process.env.PORT || 8000}`);

        // })
        app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
            console.log(`☸️ Server is running on port ${process.env.PORT || 8000}`);
        });

    })
    .catch((error) => {
        console.error("❌ Failed to connect MONGODB:", error);
        process.exit(1);
    })
