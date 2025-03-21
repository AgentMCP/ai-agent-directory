// Test script to verify that memory cache is working
// This will log the CACHED_SEARCH_RESULTS variable from ScrapeService

// Import the ScrapeService
import { ScrapeService } from './src/services/ScrapeService.js';

// Function to test the caching mechanism
async function testMemoryCache() {
  console.log('Starting memory cache test...');
  
  // First search - should populate the cache
  console.log('Performing first search...');
  const firstResults = await ScrapeService.scrapeGitHubRepositories('test query');
  console.log(`First search returned ${firstResults.length} results`);
  
  // Second search with the same query - should use the cache
  console.log('Performing second search with same query...');
  const secondResults = await ScrapeService.scrapeGitHubRepositories('test query');
  console.log(`Second search returned ${secondResults.length} results`);
  
  // Check if the second search used the cache
  console.log('Did the second search use the cache?', 
    secondResults === firstResults || 
    JSON.stringify(secondResults) === JSON.stringify(firstResults));
  
  console.log('Memory cache test completed');
}

// Run the test
testMemoryCache().catch(console.error);
