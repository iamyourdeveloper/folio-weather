#!/usr/bin/env node

/**
 * Test the Search API endpoints
 */

import http from 'http';

const BASE_URL = 'http://localhost:8000';

/**
 * Make HTTP request
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`Testing: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data, error: e.message });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Test search endpoints
 */
async function testSearchAPI() {
  console.log('🔍 Testing Search API Endpoints\n');

  const tests = [
    {
      name: 'API Info',
      path: '/api/search'
    },
    {
      name: 'Database Stats',
      path: '/api/search/stats'
    },
    {
      name: 'Search Cities - New York',
      path: '/api/search/cities?q=New York&limit=5'
    },
    {
      name: 'Search Cities - Springfield',
      path: '/api/search/cities?q=Springfield&limit=10'
    },
    {
      name: 'Search US Only - Springfield',
      path: '/api/search/cities?q=Springfield&country=US&limit=10'
    },
    {
      name: 'Cities by State - California',
      path: '/api/search/cities/us/CA?limit=10'
    },
    {
      name: 'Cities by State with Query - CA San',
      path: '/api/search/cities/us/CA?q=San&limit=5'
    },
    {
      name: 'Suggestions - Chi',
      path: '/api/search/suggestions?q=Chi&limit=5'
    },
    {
      name: 'Random Suggestions',
      path: '/api/search/suggestions?limit=5'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test.path);
      
      if (result.status === 200 && result.data.success) {
        console.log(`✅ ${test.name}: PASSED`);
        
        // Show some sample data
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log(`   Found ${result.data.data.length} results`);
          if (result.data.data.length > 0) {
            console.log(`   Sample: ${result.data.data[0].name || result.data.data[0].city}`);
          }
        } else if (result.data.data && typeof result.data.data === 'object') {
          console.log(`   Data keys: ${Object.keys(result.data.data).join(', ')}`);
        }
        
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Error: ${result.data.error || 'Unknown error'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All search API tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check server status and implementation.');
  }
}

// Run tests
testSearchAPI().catch(console.error);
