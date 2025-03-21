import React, { useEffect, useState } from 'react';
import { ScrapeService } from '../services/ScrapeService';
import { Agent } from '../types';
import { Button } from './ui/button';

const TestMemoryCache: React.FC = () => {
  const [firstResults, setFirstResults] = useState<Agent[]>([]);
  const [secondResults, setSecondResults] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testQuery, setTestQuery] = useState('AI Agent MCP');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  const runTest = async () => {
    setIsLoading(true);
    setLog([]);
    
    try {
      // First search - should populate the cache
      addLog('Performing first search...');
      const firstSearchResults = await ScrapeService.scrapeGitHubRepositories(testQuery);
      setFirstResults(firstSearchResults);
      addLog(`First search returned ${firstSearchResults.length} results`);
      
      // Second search with the same query - should use the cache
      addLog('Performing second search with same query...');
      const secondSearchResults = await ScrapeService.scrapeGitHubRepositories(testQuery);
      setSecondResults(secondSearchResults);
      addLog(`Second search returned ${secondSearchResults.length} results`);
      
      // Check if the second search used the cache
      const usedCache = 
        secondSearchResults === firstSearchResults || 
        JSON.stringify(secondSearchResults) === JSON.stringify(firstSearchResults);
      
      addLog(`Did the second search use the cache? ${usedCache ? 'YES' : 'NO'}`);
      
      if (usedCache) {
        addLog('✅ Memory cache is working correctly!');
      } else {
        addLog('❌ Memory cache is NOT working correctly!');
      }
    } catch (error) {
      addLog(`Error during test: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-md">
      <h2 className="text-xl font-bold mb-4 text-white">Memory Cache Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">Test Query:</label>
        <input
          type="text"
          value={testQuery}
          onChange={(e) => setTestQuery(e.target.value)}
          className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
        />
      </div>
      
      <Button
        onClick={runTest}
        disabled={isLoading}
        className="mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
      >
        {isLoading ? 'Testing...' : 'Run Memory Cache Test'}
      </Button>
      
      <div className="bg-black/30 p-3 rounded-md text-white font-mono text-sm">
        <div className="mb-2 font-bold">Test Log:</div>
        {log.length > 0 ? (
          <ul className="space-y-1">
            {log.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p className="text-white/50">Run the test to see results...</p>
        )}
      </div>
    </div>
  );
};

export default TestMemoryCache;
