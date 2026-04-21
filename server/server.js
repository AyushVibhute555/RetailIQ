// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// 🛠️ THE CORS FIX: Added an array of allowed origins
app.use(
  cors({
    origin: [
      "http://localhost:3000", // For local development
      "https://retailiq-saas.vercel.app" // Replace this with your actual live Vercel URL!
    ],
    credentials: true,
  })
);

app.use(morgan("dev"));

// Root route
app.get("/", (req, res) => res.send("RetailIQ backend running"));

// Authentication (public)
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/shops", orderRoutes); // Note: You might want to mount this to "/api/orders" if it causes conflicts

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Product routes
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));