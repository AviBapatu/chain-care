import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/authRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

connectDB();

app.use("/api/auth", router);

app.listen(PORT, () => {
  console.log(`Server is Up Baby! Running on PORT: ${PORT}`);
});
