import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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

// Database connection
const connectDB = async () => {
  if (
    !process.env.MONGODB_URI ||
    process.env.MONGODB_URI === "mongodb://localhost:27017/weather-app"
  ) {
    console.log("⚠️ Running in demo mode without MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(
      "Database connection failed, running in demo mode:",
      error.message
    );
  }
};

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

// Import route handlers
import weatherRoutes from "./routes/weather.js";
import userRoutes from "./routes/users.js";
import searchRoutes from "./routes/search.js";

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

// Add global error handlers to prevent crashes
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  // Don't exit immediately, allow graceful shutdown
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit, log and continue
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

  // Close server connections
  if (server) {
    server.close((err) => {
      if (err) {
        console.error("Error during server shutdown:", err);
        process.exit(1);
      }

      // Close database connection
      if (mongoose.connection.readyState !== 0) {
        mongoose.connection.close(() => {
          console.log("Database connection closed.");
          console.log("✅ Graceful shutdown complete");
          process.exit(0);
        });
      } else {
        console.log("✅ Graceful shutdown complete");
        process.exit(0);
      }
    });

    // Force exit after timeout
    setTimeout(() => {
      console.error("❌ Force exit due to timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
let server;
const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
      console.log(
        `🔑 API Key configured: ${
          process.env.OPENWEATHER_API_KEY ? "Yes" : "No"
        }`
      );
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
