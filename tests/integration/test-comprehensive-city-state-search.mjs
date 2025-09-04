#!/usr/bin/env node

/**
 * Comprehensive Test Suite for City-State Search Functionality
 * Tests all aspects of the enhanced search system including:
 * - US cities with state information
 * - State name searches (e.g., "California" returns cities in CA)
 * - Real-time autocomplete suggestions
 * - Backend search API endpoints
 * - Frontend integration
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TIMEOUT = 10000;

// Test utilities
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${error.message}`);
      if (error.response?.data) {
        console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      this.failed++;
    }
    this.tests.push({ name, passed: this.failed === 0 });
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.tests.filter(t => !t.passed).forEach(t => {
        console.log(`   - ${t.name}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    return this.failed === 0;
  }
}

// Helper functions
const makeRequest = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });
  
  const response = await axios.get(url.toString(), { timeout: TEST_TIMEOUT });
  return response.data;
};

const assertResponseStructure = (response, requiredFields = []) => {
  if (!response.success) {
    throw new Error(`API response indicates failure: ${response.error || 'Unknown error'}`);
  }
  
  if (!Array.isArray(response.data)) {
    throw new Error('Response data should be an array');
  }
  
  requiredFields.forEach(field => {
    if (!(field in response)) {
      throw new Error(`Response missing required field: ${field}`);
    }
  });
};

const assertCityHasState = (city, expectedState = null) => {
  if (!city.city || !city.state || !city.name) {
    throw new Error(`City missing required fields: ${JSON.stringify(city)}`);
  }
  
  if (!city.name.includes(city.state)) {
    throw new Error(`City name "${city.name}" should include state "${city.state}"`);
  }
  
  if (expectedState && city.state !== expectedState) {
    throw new Error(`Expected state "${expectedState}" but got "${city.state}"`);
  }
  
  if (city.country !== 'US') {
    throw new Error(`Expected US city but got country "${city.country}"`);
  }
};

// Main test suite
async function runTests() {
  const runner = new TestRunner();
  
  console.log('🚀 Starting Comprehensive City-State Search Tests');
  console.log('=' .repeat(60));

  // Test 1: Basic city search with state information
  await runner.test('Basic city search returns cities with states', async () => {
    const response = await makeRequest('/search/cities', { q: 'New York', limit: 10 });
    assertResponseStructure(response, ['query', 'count', 'limit']);
    
    if (response.data.length === 0) {
      throw new Error('No results returned for "New York"');
    }
    
    // Check that US cities have state information
    const usCities = response.data.filter(city => city.country === 'US');
    if (usCities.length === 0) {
      throw new Error('No US cities returned for "New York"');
    }
    
    usCities.forEach(city => assertCityHasState(city));
    console.log(`   Found ${usCities.length} US cities with state information`);
  });

  // Test 2: State name search (e.g., "California" returns CA cities)
  await runner.test('State name search returns cities from that state', async () => {
    const response = await makeRequest('/search/cities', { q: 'California', limit: 20 });
    assertResponseStructure(response);
    
    if (response.data.length === 0) {
      throw new Error('No results returned for "California"');
    }
    
    // All results should be from California (CA)
    const caCities = response.data.filter(city => city.state === 'CA');
    if (caCities.length === 0) {
      throw new Error('No California cities returned when searching "California"');
    }
    
    caCities.forEach(city => assertCityHasState(city, 'CA'));
    console.log(`   Found ${caCities.length} cities in California`);
  });

  // Test 3: State abbreviation search
  await runner.test('State abbreviation search works correctly', async () => {
    const response = await makeRequest('/search/cities', { q: 'TX', limit: 15 });
    assertResponseStructure(response);
    
    const texasCities = response.data.filter(city => city.state === 'TX');
    if (texasCities.length === 0) {
      throw new Error('No Texas cities returned when searching "TX"');
    }
    
    texasCities.forEach(city => assertCityHasState(city, 'TX'));
    console.log(`   Found ${texasCities.length} cities in Texas`);
  });

  // Test 4: Autocomplete endpoint
  await runner.test('Autocomplete endpoint provides formatted suggestions', async () => {
    const response = await makeRequest('/search/autocomplete', { q: 'Los', limit: 8 });
    assertResponseStructure(response);
    
    if (response.data.length === 0) {
      throw new Error('No autocomplete results for "Los"');
    }
    
    // Check autocomplete-specific formatting
    response.data.forEach(suggestion => {
      if (!suggestion.id || !suggestion.displayName || !suggestion.type) {
        throw new Error(`Autocomplete suggestion missing required fields: ${JSON.stringify(suggestion)}`);
      }
      
      if (suggestion.type === 'us' && !suggestion.state) {
        throw new Error(`US suggestion missing state: ${JSON.stringify(suggestion)}`);
      }
    });
    
    console.log(`   Found ${response.data.length} autocomplete suggestions`);
  });

  // Test 5: US-only search
  await runner.test('US-only search filters correctly', async () => {
    const response = await makeRequest('/search/cities', { q: 'Springfield', country: 'US', limit: 20 });
    assertResponseStructure(response);
    
    if (response.data.length === 0) {
      throw new Error('No results for US-only Springfield search');
    }
    
    // All results should be US cities with states
    response.data.forEach(city => {
      if (city.country !== 'US') {
        throw new Error(`Non-US city in US-only search: ${JSON.stringify(city)}`);
      }
      assertCityHasState(city);
    });
    
    console.log(`   Found ${response.data.length} Springfield cities in US`);
  });

  // Test 6: Cities by state endpoint
  await runner.test('Cities by state endpoint works correctly', async () => {
    const response = await makeRequest('/search/cities/us/FL', { limit: 25 });
    assertResponseStructure(response, ['state']);
    
    if (response.data.length === 0) {
      throw new Error('No cities returned for Florida');
    }
    
    if (response.state !== 'FL') {
      throw new Error(`Expected state FL but got ${response.state}`);
    }
    
    response.data.forEach(city => assertCityHasState(city, 'FL'));
    console.log(`   Found ${response.data.length} cities in Florida`);
  });

  // Test 7: Suggestions endpoint with real-time mode
  await runner.test('Suggestions endpoint supports real-time mode', async () => {
    const response = await makeRequest('/search/suggestions', { q: 'Chi', realtime: 'true', limit: 10 });
    assertResponseStructure(response, ['realtime']);
    
    if (!response.realtime) {
      throw new Error('Real-time mode not enabled in response');
    }
    
    if (response.data.length === 0) {
      throw new Error('No real-time suggestions for "Chi"');
    }
    
    // Check that real-time suggestions have proper formatting
    response.data.forEach(suggestion => {
      if (suggestion.type === 'us' && !suggestion.displayName?.includes(',')) {
        console.warn(`US suggestion might be missing state in display name: ${suggestion.displayName}`);
      }
    });
    
    console.log(`   Found ${response.data.length} real-time suggestions`);
  });

  // Test 8: Search database statistics
  await runner.test('Search statistics endpoint provides comprehensive data', async () => {
    const response = await makeRequest('/search/stats');
    
    if (!response.success || !response.data) {
      throw new Error('Stats endpoint failed or missing data');
    }
    
    const stats = response.data;
    const requiredStats = ['totalUSCities', 'totalInternationalCities', 'totalCities', 'usStatesCount', 'citiesByState'];
    
    requiredStats.forEach(stat => {
      if (!(stat in stats)) {
        throw new Error(`Stats missing required field: ${stat}`);
      }
    });
    
    if (stats.totalUSCities < 1000) {
      throw new Error(`Expected at least 1000 US cities, got ${stats.totalUSCities}`);
    }
    
    if (stats.usStatesCount < 50) {
      throw new Error(`Expected at least 50 states, got ${stats.usStatesCount}`);
    }
    
    console.log(`   Database contains ${stats.totalUSCities} US cities across ${stats.usStatesCount} states`);
  });

  // Test 9: Complex city names with states
  await runner.test('Complex city names are handled correctly', async () => {
    const testCities = ['San Francisco', 'Las Vegas', 'New Orleans', 'Salt Lake City'];
    
    for (const cityName of testCities) {
      const response = await makeRequest('/search/cities', { q: cityName, country: 'US', limit: 5 });
      
      if (response.data.length === 0) {
        throw new Error(`No results for "${cityName}"`);
      }
      
      const exactMatch = response.data.find(city => 
        city.city.toLowerCase() === cityName.toLowerCase() && city.country === 'US'
      );
      
      if (!exactMatch) {
        throw new Error(`No exact US match found for "${cityName}"`);
      }
      
      assertCityHasState(exactMatch);
    }
    
    console.log(`   Successfully found all ${testCities.length} complex city names with states`);
  });

  // Test 10: Edge cases and error handling
  await runner.test('Edge cases are handled gracefully', async () => {
    // Empty query
    const emptyResponse = await makeRequest('/search/autocomplete', { q: '', limit: 5 });
    if (emptyResponse.data.length !== 0) {
      throw new Error('Empty query should return no results');
    }
    
    // Very short query
    const shortResponse = await makeRequest('/search/autocomplete', { q: 'A', limit: 5 });
    // Should either return results or empty array, but not error
    
    // Invalid state code
    try {
      await makeRequest('/search/cities/us/ZZ');
      throw new Error('Invalid state code should return 404');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Expected 404 for invalid state, got ${error.response?.status}`);
      }
    }
    
    console.log('   Edge cases handled correctly');
  });

  return runner.summary();
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🏁 Comprehensive City-State Search Test Suite');
  console.log('Testing enhanced search functionality with state information\n');
  
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test suite failed to run:', error.message);
      process.exit(1);
    });
}
