import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use("/api/reports", reportRoutes); /** Moved here due to issue with form-data which is being parsed as json and getting recieved as in the controller */
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/profile", profileRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is Up Baby! Running on PORT: ${PORT}`);
});
1;

// https://localhost:5000/api/auth/register
