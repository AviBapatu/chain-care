import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is Up Baby! Running on PORT: ${PORT}`);
});
1;
