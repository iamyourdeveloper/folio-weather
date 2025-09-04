#!/usr/bin/env node

/**
 * Demo script showing the US Cities State Display solution in action
 * This demonstrates how any US city now displays with state information
 */

import weatherService from './backend/utils/weatherService.js';

console.log('🇺🇸 US Cities State Display Solution - Live Demo\n');
console.log('=' .repeat(60));

// Demo cities showing the range of coverage
const demoCities = [
  'Chicago',        // Major city
  'Frederick',      // Smaller city  
  'Montpelier',     // Smallest state capital
  'Springfield',    // Ambiguous name
  'Key West',       // Distinctive small city
  'St. Louis',      // Special characters
];

console.log('\n🎬 Live demonstration with real weather API calls:\n');

async function runDemo() {
  for (let i = 0; i < demoCities.length; i++) {
    const city = demoCities[i];
    
    try {
      console.log(`${i + 1}. Searching for: "${city}"`);
      
      const result = await weatherService.getCurrentWeatherByCity(city, 'metric');
      
      console.log(`   ✨ Result: "${result.location.name}"`);
      console.log(`   🌡️  Temperature: ${result.current.temperature}°C`);
      console.log(`   📍 State: ${result.location.state}`);
      console.log(`   🌍 Country: ${result.location.country}\n`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
    
    // Small delay between requests
    if (i < demoCities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('🎉 Demo completed!');
  console.log('\n📝 Key Benefits:');
  console.log('   • All US cities now display with state information');
  console.log('   • Ambiguous city names are resolved using coordinates');
  console.log('   • Works with cities of any size, from major metros to small towns');
  console.log('   • Consistent formatting across the entire application');
  console.log('   • No manual configuration required - works automatically');
  
  console.log('\n🔍 Try searching for any US city in the app - it will now');
  console.log('   display with proper state information!');
}

runDemo().catch(console.error);
