#!/usr/bin/env node

/**
 * Test script to verify connection fixes
 */

import axios from "axios";

const BACKEND_URL = "http://localhost:8000";
const FRONTEND_URL = "http://localhost:3003";

async function testBackendConnection() {
  console.log("🔍 Testing backend connection...");

  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
    });

    console.log("✅ Backend health check:", healthResponse.data);

    // Test weather API
    const weatherResponse = await axios.get(
      `${BACKEND_URL}/api/weather/current/city/London`,
      {
        params: { units: "metric" },
        timeout: 15000,
      }
    );

    console.log("✅ Weather API test:", {
      status: weatherResponse.status,
      location: weatherResponse.data.data?.location?.name,
      temp: weatherResponse.data.data?.current?.temperature,
    });

    return true;
  } catch (error) {
    console.error("❌ Backend test failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return false;
  }
}

async function testFrontendConnection() {
  console.log("🔍 Testing frontend proxy...");

  try {
    const response = await axios.get(`${FRONTEND_URL}/api/health`, {
      timeout: 10000,
    });

    console.log("✅ Frontend proxy test:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Frontend proxy test failed:", {
      message: error.message,
      status: error.response?.status,
    });
    return false;
  }
}

async function runTests() {
  console.log("🚀 Running connection tests...\n");

  const backendOk = await testBackendConnection();
  console.log("");

  const frontendOk = await testFrontendConnection();
  console.log("");

  if (backendOk && frontendOk) {
    console.log("🎉 All tests passed! Connection issues should be resolved.");
  } else {
    console.log(
      "⚠️  Some tests failed. Please check the server configurations."
    );
  }
}

runTests().catch(console.error);
