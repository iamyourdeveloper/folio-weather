#!/usr/bin/env node

// Test script to check location name formatting
import fetch from "node-fetch";

console.log("🧪 Testing location name formatting...\n");

async function testLocationAPI(city) {
  try {
    console.log(`Testing: "${city}"`);

    const response = await fetch(
      `http://localhost:8000/api/weather/current/city/${encodeURIComponent(
        city
      )}?units=metric`
    );

    if (!response.ok) {
      console.log(
        `❌ API Error: ${response.status} - ${response.statusText}\n`
      );
      return;
    }

    const data = await response.json();

    if (data.success && data.data?.location) {
      const location = data.data.location;
      console.log(`✅ Location name: "${location.name}"`);
      console.log(`✅ Location city: "${location.city}"`);
      console.log(`✅ Location country: "${location.country}"`);
    } else {
      console.log(`❌ Unexpected response format`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  console.log("");
}

async function main() {
  // Test different case variations
  await testLocationAPI("new york");
  await testLocationAPI("NEW YORK");
  await testLocationAPI("New York");
  await testLocationAPI("nEw YoRk");
}

// Wait for server to be ready
setTimeout(main, 2000);
