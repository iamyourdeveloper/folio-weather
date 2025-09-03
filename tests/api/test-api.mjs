// Test API call to verify location name formatting

const testCases = [
  "new york, ny",
  "baltimore, md",
  "london, uk",
  "paris, france",
];

async function testLocationFormatting() {
  console.log("Testing Weather API Location Name Formatting");
  console.log("===========================================");

  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: "${testCase}"`);
      console.log("----------------------------------------");

      const response = await fetch(
        `http://localhost:8000/api/weather/current/city/${encodeURIComponent(
          testCase
        )}?originalName=${encodeURIComponent(testCase)}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Input: "${testCase}"`);
        console.log(`   Output: "${data.location.name}"`);
        console.log(`   City: "${data.location.city}"`);
        console.log(`   Country: "${data.location.country}"`);
      } else {
        console.log(`❌ Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testLocationFormatting();
