import app, { allowedOrigins } from "./app.js";
const PORT = process.env.PORT || 8000;

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
