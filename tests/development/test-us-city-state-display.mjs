#!/usr/bin/env node

/**
 * Test script for US city state display functionality
 * Tests various US cities to ensure they display with proper state information
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getStateForUSCity, formatUSCityWithState, isUSCity } from '../../backend/data/usCitiesStateMapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test cities - mix of major cities, smaller towns, and edge cases
const testCities = [
  // Major cities that should be easily recognized
  { name: 'New York', expectedState: 'NY', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', expectedState: 'CA', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', expectedState: 'IL', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', expectedState: 'TX', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', expectedState: 'AZ', lat: 33.4484, lon: -112.0740 },
  
  // Cities with common names in multiple states
  { name: 'Springfield', expectedState: 'IL', lat: 39.7817, lon: -89.6501 }, // Illinois
  { name: 'Springfield', expectedState: 'MA', lat: 42.1015, lon: -72.5898 }, // Massachusetts
  { name: 'Springfield', expectedState: 'MO', lat: 37.2153, lon: -93.2982 }, // Missouri
  
  { name: 'Portland', expectedState: 'OR', lat: 45.5152, lon: -122.6784 }, // Oregon
  { name: 'Portland', expectedState: 'ME', lat: 43.6591, lon: -70.2568 }, // Maine
  
  { name: 'Columbus', expectedState: 'OH', lat: 39.9612, lon: -82.9988 }, // Ohio
  { name: 'Columbus', expectedState: 'GA', lat: 32.4609, lon: -84.9877 }, // Georgia
  
  // Smaller cities and towns
  { name: 'Frederick', expectedState: 'MD', lat: 39.4143, lon: -77.4105 },
  { name: 'Bakersfield', expectedState: 'CA', lat: 35.3733, lon: -119.0187 },
  { name: 'Fargo', expectedState: 'ND', lat: 46.8772, lon: -96.7898 },
  { name: 'Anchorage', expectedState: 'AK', lat: 61.2181, lon: -149.9003 },
  { name: 'Honolulu', expectedState: 'HI', lat: 21.3099, lon: -157.8581 },
  
  // Edge cases and less common cities
  { name: 'Cheyenne', expectedState: 'WY', lat: 41.1400, lon: -104.8197 },
  { name: 'Montpelier', expectedState: 'VT', lat: 44.2601, lon: -72.5806 },
  { name: 'Pierre', expectedState: 'SD', lat: 44.3683, lon: -100.3510 },
  
  // Cities with special characters or formatting
  { name: 'St. Louis', expectedState: 'MO', lat: 38.6270, lon: -90.1994 },
  { name: 'St. Petersburg', expectedState: 'FL', lat: 27.7676, lon: -82.6403 },
  { name: 'Las Vegas', expectedState: 'NV', lat: 36.1699, lon: -115.1398 },
  
  // Test some cities that might not be in our database
  { name: 'Smalltown', expectedState: null, lat: 40.0, lon: -100.0 },
  { name: 'Nonexistent City', expectedState: null, lat: 35.0, lon: -90.0 },
];

console.log('🧪 Testing US City State Display Functionality\n');
console.log('=' .repeat(60));

// Test the core functions
console.log('\n📋 Testing Core Functions:');

let passed = 0;
let failed = 0;

testCities.forEach((testCity, index) => {
  console.log(`\n${index + 1}. Testing: "${testCity.name}"`);
  console.log(`   Coordinates: ${testCity.lat}, ${testCity.lon}`);
  
  // Test isUSCity function
  const isUSCityResult = isUSCity(testCity.name);
  console.log(`   Is US City: ${isUSCityResult}`);
  
  // Test getStateForUSCity function
  const detectedState = getStateForUSCity(testCity.name, testCity.lat, testCity.lon);
  console.log(`   Detected State: ${detectedState || 'None'}`);
  console.log(`   Expected State: ${testCity.expectedState || 'None'}`);
  
  // Test formatUSCityWithState function
  if (detectedState) {
    const formattedName = formatUSCityWithState(testCity.name, detectedState);
    console.log(`   Formatted Name: "${formattedName}"`);
  }
  
  // Check if result matches expectation
  const testPassed = detectedState === testCity.expectedState;
  console.log(`   Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (testPassed) {
    passed++;
  } else {
    failed++;
    console.log(`   ⚠️  Expected "${testCity.expectedState}", got "${detectedState}"`);
  }
});

console.log('\n' + '=' .repeat(60));
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! US city state detection is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Review the results above for details.');
}

// Test edge cases
console.log('\n🔬 Testing Edge Cases:');

const edgeCases = [
  { input: '', description: 'Empty string' },
  { input: null, description: 'Null input' },
  { input: undefined, description: 'Undefined input' },
  { input: 123, description: 'Non-string input' },
  { input: 'Paris', description: 'Non-US city' },
  { input: 'CHICAGO', description: 'All caps city' },
  { input: 'chicago', description: 'All lowercase city' },
  { input: 'ChIcAgO', description: 'Mixed case city' },
  { input: '  New York  ', description: 'City with extra spaces' },
];

edgeCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.description}: ${JSON.stringify(testCase.input)}`);
  try {
    const isUS = isUSCity(testCase.input);
    const state = getStateForUSCity(testCase.input);
    console.log(`   Is US City: ${isUS}`);
    console.log(`   Detected State: ${state || 'None'}`);
    console.log(`   Result: ✅ Handled gracefully`);
  } catch (error) {
    console.log(`   Result: ❌ Error: ${error.message}`);
  }
});

console.log('\n✨ Test completed!');
