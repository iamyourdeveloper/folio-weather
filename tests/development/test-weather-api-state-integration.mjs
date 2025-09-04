#!/usr/bin/env node

/**
 * Test script for Weather API integration with US city state display
 * Tests the actual weather service to ensure it returns proper state information
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import weatherService from '../../backend/utils/weatherService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test cities for API integration
const testCities = [
  'Chicago',        // Major city - should get "Chicago, IL"
  'Portland',       // Ambiguous name - should get state based on coordinates
  'Frederick',      // Smaller city - should get "Frederick, MD"
  'Springfield',    // Very common name - should get state based on coordinates
  'Austin',         // Should get "Austin, TX"
  'Miami',          // Should get "Miami, FL"
  'Phoenix',        // Should get "Phoenix, AZ"
  'Seattle',        // Should get "Seattle, WA"
];

console.log('🌐 Testing Weather API Integration with US City State Display\n');
console.log('=' .repeat(70));

async function testWeatherAPI() {
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCities.length; i++) {
    const city = testCities[i];
    console.log(`\n${i + 1}. Testing Weather API for: "${city}"`);
    
    try {
      // Test current weather API
      console.log('   📊 Fetching current weather...');
      const weatherData = await weatherService.getCurrentWeatherByCity(city, 'metric');
      
      console.log(`   🏙️  API City Name: "${weatherData.location.city}"`);
      console.log(`   🌍 Country: "${weatherData.location.country}"`);
      console.log(`   🏛️  State: "${weatherData.location.state || 'None'}"`);
      console.log(`   📍 Display Name: "${weatherData.location.name}"`);
      console.log(`   🌡️  Temperature: ${weatherData.current.temperature}°C`);
      console.log(`   📊 Coordinates: ${weatherData.location.coordinates.lat}, ${weatherData.location.coordinates.lon}`);
      
      // Check if it's a US city and has state information
      const isUSCity = weatherData.location.country === 'US';
      const hasState = weatherData.location.state !== null && weatherData.location.state !== undefined;
      const displayNameHasState = weatherData.location.name.includes(',');
      
      console.log(`   🇺🇸 Is US City: ${isUSCity}`);
      console.log(`   🏛️  Has State Data: ${hasState}`);
      console.log(`   📝 Display Name Has State: ${displayNameHasState}`);
      
      // Determine if test passed
      let testPassed = true;
      let failureReasons = [];
      
      if (isUSCity && !hasState) {
        testPassed = false;
        failureReasons.push('US city missing state information');
      }
      
      if (isUSCity && !displayNameHasState) {
        testPassed = false;
        failureReasons.push('US city display name missing state');
      }
      
      if (testPassed) {
        console.log(`   ✅ PASS: US city properly formatted with state`);
        passed++;
      } else {
        console.log(`   ❌ FAIL: ${failureReasons.join(', ')}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
    
    // Add a small delay to avoid rate limiting
    if (i < testCities.length - 1) {
      console.log('   ⏳ Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '=' .repeat(70));
  console.log(`\n📊 API Integration Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All API integration tests passed!');
    console.log('   US cities are properly displaying with state information.');
  } else {
    console.log('\n⚠️  Some API tests failed. Check the results above for details.');
  }
}

// Test forecast API as well
async function testForecastAPI() {
  console.log('\n🔮 Testing Forecast API Integration:');
  console.log('-' .repeat(40));
  
  const testCity = 'Denver'; // Should get "Denver, CO"
  
  try {
    console.log(`\n📅 Fetching 5-day forecast for: "${testCity}"`);
    const forecastData = await weatherService.getForecastByCity(testCity, 'metric');
    
    console.log(`   🏙️  API City Name: "${forecastData.location.city}"`);
    console.log(`   🌍 Country: "${forecastData.location.country}"`);
    console.log(`   🏛️  State: "${forecastData.location.state || 'None'}"`);
    console.log(`   📍 Display Name: "${forecastData.location.name}"`);
    console.log(`   📅 Forecast Days: ${forecastData.forecast.length}`);
    
    const isUSCity = forecastData.location.country === 'US';
    const hasState = forecastData.location.state !== null;
    const displayNameHasState = forecastData.location.name.includes(',');
    
    if (isUSCity && hasState && displayNameHasState) {
      console.log(`   ✅ PASS: Forecast API properly formats US cities with state`);
    } else {
      console.log(`   ❌ FAIL: Forecast API missing proper state formatting`);
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
}

// Run the tests
async function runAllTests() {
  try {
    await testWeatherAPI();
    await testForecastAPI();
    console.log('\n✨ All tests completed!');
  } catch (error) {
    console.error('🚨 Test suite failed:', error.message);
    process.exit(1);
  }
}

runAllTests();
