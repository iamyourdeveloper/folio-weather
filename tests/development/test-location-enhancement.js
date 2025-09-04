// Quick test to verify location name enhancement
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import weatherService from "./backend/utils/weatherService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testLocationEnhancement() {
  console.log("Testing location name enhancement...\n");

  try {
    // Test 1: Without original name (should show just city name from API)
    console.log("1. Testing Detroit without original name:");
    const result1 = await weatherService.getCurrentWeatherByCity(
      "Detroit",
      "imperial"
    );
    console.log(`   Location name: ${result1.location.name}`);
    console.log(`   City: ${result1.location.city}`);
    console.log(`   Country: ${result1.location.country}\n`);

    // Test 2: With original name (should show enhanced name)
    console.log('2. Testing Detroit with original name "Detroit, MI":');
    const result2 = await weatherService.getCurrentWeatherByCity(
      "Detroit",
      "imperial",
      "Detroit, MI"
    );
    console.log(`   Location name: ${result2.location.name}`);
    console.log(`   City: ${result2.location.city}`);
    console.log(`   Country: ${result2.location.country}\n`);

    // Test 3: Another example with state
    console.log('3. Testing Los Angeles with original name "Los Angeles, CA":');
    const result3 = await weatherService.getCurrentWeatherByCity(
      "Los Angeles",
      "imperial",
      "Los Angeles, CA"
    );
    console.log(`   Location name: ${result3.location.name}`);
    console.log(`   City: ${result3.location.city}`);
    console.log(`   Country: ${result3.location.country}\n`);

    console.log("✅ Location enhancement test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testLocationEnhancement();
