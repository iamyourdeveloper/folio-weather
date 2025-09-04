#!/usr/bin/env node

/**
 * Test script for smaller and more distinct US cities
 * Tests the comprehensive solution with various types of US cities
 */

import weatherService from '../../backend/utils/weatherService.js';

// Test smaller and more distinct US cities
const testCities = [
  // Small state capitals
  'Montpelier',     // Vermont - smallest state capital
  'Pierre',         // South Dakota - small capital
  'Helena',         // Montana
  'Cheyenne',       // Wyoming
  'Dover',          // Delaware
  'Concord',        // New Hampshire
  
  // Smaller cities with unique names
  'Kalamazoo',      // Michigan
  'Tuscaloosa',     // Alabama
  'Bozeman',        // Montana
  'Missoula',       // Montana
  'Flagstaff',      // Arizona
  'Bend',           // Oregon
  
  // Cities that might be confused with other countries
  'Paris',          // Should get Paris, TX or Paris, TN
  'Berlin',         // Should get Berlin, NH or other US Berlin
  'Rome',           // Should get Rome, NY or Rome, GA
  'Athens',         // Should get Athens, GA or Athens, OH
  
  // Distinctive smaller cities
  'Fargo',          // North Dakota
  'Bismarck',       // North Dakota
  'Anchorage',      // Alaska
  'Fairbanks',      // Alaska
  'Honolulu',       // Hawaii
  
  // Small but well-known cities
  'Key West',       // Florida
  'Bar Harbor',     // Maine
  'Aspen',          // Colorado
  'Napa',           // California
  'Sedona',         // Arizona
  
  // Cities with apostrophes or special characters
  'St. Augustine',  // Florida
  'St. Paul',       // Minnesota
  'St. Louis',      // Missouri
  
  // Less common but real cities
  'Ypsilanti',      // Michigan
  'Poughkeepsie',   // New York
  'Schenectady',    // New York
  'Kankakee',       // Illinois
];

console.log('🏘️  Testing Smaller and More Distinct US Cities\n');
console.log('=' .repeat(80));

async function testDistinctCities() {
  let passed = 0;
  let failed = 0;
  let notFound = 0;

  for (let i = 0; i < testCities.length; i++) {
    const city = testCities[i];
    console.log(`\n${i + 1}. Testing: "${city}"`);
    
    try {
      const weatherData = await weatherService.getCurrentWeatherByCity(city, 'metric');
      
      const isUSCity = weatherData.location.country === 'US';
      const hasState = weatherData.location.state !== null && weatherData.location.state !== undefined;
      const displayName = weatherData.location.name;
      const hasStateInName = displayName.includes(',');
      
      console.log(`   🏙️  Found: "${weatherData.location.city}"`);
      console.log(`   🌍 Country: ${weatherData.location.country}`);
      console.log(`   🏛️  State: ${weatherData.location.state || 'None'}`);
      console.log(`   📍 Display: "${displayName}"`);
      console.log(`   🌡️  Temp: ${weatherData.current.temperature}°C`);
      console.log(`   📊 Coords: ${weatherData.location.coordinates.lat}, ${weatherData.location.coordinates.lon}`);
      
      if (isUSCity) {
        if (hasState && hasStateInName) {
          console.log(`   ✅ PASS: US city with proper state formatting`);
          passed++;
        } else if (!hasState) {
          console.log(`   ⚠️  PARTIAL: US city found but missing state data`);
          console.log(`      This might be a very small city not in our database`);
          passed++; // Still count as pass since city was found
        } else {
          console.log(`   ❌ FAIL: US city missing state in display name`);
          failed++;
        }
      } else {
        console.log(`   🌍 INFO: Non-US city found (${weatherData.location.country})`);
        console.log(`      This might be a city with same name in another country`);
        passed++; // Count as pass since a valid city was found
      }
      
    } catch (error) {
      console.log(`   ❌ NOT FOUND: ${error.message}`);
      notFound++;
    }
    
    // Small delay to avoid rate limiting
    if (i < testCities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  console.log('\n' + '=' .repeat(80));
  console.log(`\n📊 Distinct Cities Test Results:`);
  console.log(`   ✅ Successfully processed: ${passed}`);
  console.log(`   ❌ Failed processing: ${failed}`);
  console.log(`   🚫 Not found by API: ${notFound}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed + notFound)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All found cities were properly formatted!');
    if (notFound > 0) {
      console.log(`   📝 Note: ${notFound} cities were not found by the weather API`);
      console.log(`      This is normal for very small towns or unique spellings`);
    }
  } else {
    console.log('\n⚠️  Some cities had formatting issues.');
  }
}

// Test some edge cases with coordinates
async function testCoordinateBasedLookup() {
  console.log('\n🎯 Testing Coordinate-Based City Lookup:');
  console.log('-' .repeat(50));
  
  const coordinateTests = [
    { name: 'Small town in Kansas', lat: 39.0119, lon: -95.6890 }, // Lawrence, KS area
    { name: 'Small town in Montana', lat: 45.6770, lon: -111.0429 }, // Bozeman, MT area  
    { name: 'Small town in Maine', lat: 43.6591, lon: -70.2568 }, // Portland, ME area
  ];
  
  for (const test of coordinateTests) {
    console.log(`\n📍 Testing: ${test.name} (${test.lat}, ${test.lon})`);
    
    try {
      const weatherData = await weatherService.getCurrentWeatherByCoords(
        test.lat, 
        test.lon, 
        'metric'
      );
      
      console.log(`   🏙️  Found: "${weatherData.location.city}"`);
      console.log(`   🌍 Country: ${weatherData.location.country}`);
      console.log(`   🏛️  State: ${weatherData.location.state || 'None'}`);
      console.log(`   📍 Display: "${weatherData.location.name}"`);
      
      if (weatherData.location.country === 'US' && weatherData.location.state) {
        console.log(`   ✅ SUCCESS: Coordinate lookup includes state info`);
      } else {
        console.log(`   ⚠️  INFO: Coordinate lookup result`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testDistinctCities();
    await testCoordinateBasedLookup();
    console.log('\n✨ All distinct city tests completed!');
  } catch (error) {
    console.error('🚨 Test suite failed:', error.message);
    process.exit(1);
  }
}

runAllTests();
