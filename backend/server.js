import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);

app.listen(PORT, () => {
  console.log(`Server is Up Baby! Running on PORT: ${PORT}`);
});
