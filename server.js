import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectMongoDB from "./db/connectDatabase.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 7777;
app.use(express.json()); // allows us to accept JSON data in the req.body

// singup
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectMongoDB();
  console.log("Server started at http://localhost:" + PORT);
});
