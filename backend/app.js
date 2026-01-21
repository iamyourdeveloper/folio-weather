import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import weatherRoutes from "./routes/weather.js";
import userRoutes from "./routes/users.js";
import searchRoutes from "./routes/search.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers

// Configure CORS to allow multiple frontend ports for development
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Weather API Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Weather API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      weather: "/api/weather",
      users: "/api/users",
    },
  });
});

// Use routes
app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

// 404 handler (keep before the error handler)
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler (must be after routes and 404)
app.use(errorHandler);

export { allowedOrigins };
export default app;
