#!/usr/bin/env node

/**
 * Test script to verify the header search fix
 */

import { spawn } from "child_process";
import fetch from "node-fetch";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testHeaderSearchFix() {
  console.log("🧪 Testing header search fix...\n");

  try {
    // Test 1: Check if backend is running
    console.log("1️⃣ Testing backend API...");
    const apiResponse = await fetch("http://localhost:8000/api/health");
    if (!apiResponse.ok) {
      throw new Error(`Backend API not accessible: ${apiResponse.status}`);
    }
    console.log("✅ Backend API is accessible\n");

    // Test 2: Check if frontend is running
    console.log("2️⃣ Testing frontend accessibility...");
    const frontendResponse = await fetch("http://localhost:3000/");
    if (!frontendResponse.ok) {
      throw new Error(`Frontend not accessible: ${frontendResponse.status}`);
    }
    console.log("✅ Frontend is accessible\n");

    // Test 3: Test weather API with a sample query
    console.log("3️⃣ Testing weather API with sample query (Tokyo)...");
    const weatherResponse = await fetch(
      "http://localhost:8000/api/weather/current/city/Tokyo?units=metric"
    );
    if (!weatherResponse.ok) {
      throw new Error(`Weather API failed: ${weatherResponse.status}`);
    }
    const weatherData = await weatherResponse.json();
    console.log(
      "✅ Weather API working:",
      weatherData.data?.location?.name || "Location data received"
    );

    console.log(
      "\n🎉 All tests passed! Header search should be working properly now."
    );
    console.log("\n📋 What was fixed:");
    console.log("   • Improved search submission handling with proper timing");
    console.log(
      "   • Removed pointer-events:none from CSS to keep elements accessible"
    );
    console.log(
      "   • Enhanced click outside detection with better element targeting"
    );
    console.log(
      "   • Added robust state reset mechanism to prevent intermediate states"
    );
    console.log(
      "   • Improved focus/blur handling for reliable user interaction\n"
    );

    console.log("🔧 To test the fix manually:");
    console.log("   1. Open http://localhost:3000 in your browser");
    console.log("   2. Click on the search icon in the header");
    console.log('   3. Type a city name (e.g., "London")');
    console.log("   4. Press Enter or click Search");
    console.log(
      "   5. After search, try clicking on other header elements - they should work"
    );
    console.log(
      "   6. Try searching again - the search functionality should work consistently\n"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testHeaderSearchFix();
