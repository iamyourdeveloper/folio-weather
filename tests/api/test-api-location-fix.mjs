#!/usr/bin/env node

// Test the actual API with different case variations
console.log("🧪 Testing Weather API location name formatting...\n");

async function testAPI(city, description) {
  try {
    console.log(`${description}: "${city}"`);

    // Use native fetch (Node 18+)
    const response = await fetch(
      `http://localhost:8000/api/weather/current/city/${encodeURIComponent(
        city
      )}?units=metric`
    );

    if (!response.ok) {
      console.log(
        `  ❌ API Error: ${response.status} - ${response.statusText}\n`
      );
      return;
    }

    const data = await response.json();

    if (data.success && data.data?.location) {
      const location = data.data.location;
      console.log(`  ✅ Location name: "${location.name}"`);
      console.log(`  ✅ Location city: "${location.city}"`);
      console.log(`  ✅ Location country: "${location.country}"`);
      console.log(`  ✅ Temperature: ${data.data.current.temperature}°C`);
    } else {
      console.log(`  ❌ Unexpected response format`);
      console.log("  " + JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
  console.log("");
}

async function main() {
  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("Testing different case variations of city names:\n");

  await testAPI("new york", "Test 1 (lowercase)");
  await testAPI("NEW YORK", "Test 2 (uppercase)");
  await testAPI("New York", "Test 3 (proper case)");
  await testAPI("nEw YoRk", "Test 4 (mixed case)");

  console.log("Testing other cities:\n");

  await testAPI("london", "Test 5 (London lowercase)");
  await testAPI("LONDON", "Test 6 (London uppercase)");
  await testAPI("tokyo", "Test 7 (Tokyo lowercase)");

  console.log("✅ API testing complete");
}

main().catch(console.error);
