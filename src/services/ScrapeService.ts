import axios from 'axios';
import { Agent } from '../types';

/**
 * Service for scraping GitHub repositories for AI Agent and MCP projects
 */
export const ScrapeService = {
  /**
   * Scrape GitHub repositories using a search query
   * @param query The search query to use
   * @returns Promise with scraped repository data
   */
  async scrapeGitHubRepositories(query: string = 'AI Agent MCP'): Promise<Agent[]> {
    try {
      // Since we're using browser-based fetch, let's simulate a search response
      // In a real-world scenario, this would be a server-side API call
      
      // These are mock data representing what we would expect from a real API
      const mockSearchResults = [
        {
          name: 'Auto-GPT',
          description: 'An experimental open-source autonomous AI agent',
          owner: 'Significant-Gravitas',
          url: 'https://github.com/Significant-Gravitas/Auto-GPT',
          stars: 153000,
          forks: 39200,
          language: 'Python',
          topics: ['ai', 'agents', 'autonomous', 'gpt'],
        },
        {
          name: 'BabyAGI',
          description: 'AI-powered task management system using LLMs',
          owner: 'yoheinakajima',
          url: 'https://github.com/yoheinakajima/babyagi',
          stars: 17700,
          forks: 2700,
          language: 'Python',
          topics: ['ai', 'agi', 'autonomous-agents'],
        },
        {
          name: 'AgentGPT',
          description: 'Deploy autonomous AI Agents on your browser',
          owner: 'reworkd',
          url: 'https://github.com/reworkd/AgentGPT',
          stars: 28100,
          forks: 5100,
          language: 'TypeScript',
          topics: ['ai', 'web', 'gpt', 'agents'],
        },
        {
          name: 'CrewAI',
          description: 'Framework for orchestrating role-playing autonomous AI agents',
          owner: 'joaomdmoura',
          url: 'https://github.com/joaomdmoura/crewAI',
          stars: 19800,
          forks: 2300,
          language: 'Python',
          topics: ['ai', 'agents', 'collaborative'],
        },
        {
          name: 'MCP Framework',
          description: 'Model Context Orchestration Framework for AI Agents',
          owner: 'AgentMCP',
          url: 'https://github.com/AgentMCP/mcp-framework',
          stars: 3500,
          forks: 450,
          language: 'TypeScript',
          topics: ['mcp', 'ai', 'context-orchestration'],
        },
        {
          name: 'SuperAGI',
          description: 'An open-source autonomous AI agent framework',
          owner: 'TransformerOptimus',
          url: 'https://github.com/TransformerOptimus/SuperAGI',
          stars: 13700,
          forks: 1700,
          language: 'Python',
          topics: ['agi', 'autonomous-agents', 'framework'],
        },
        {
          name: 'XAgent',
          description: 'Autonomous AI Agent for complex task-solving with tool-use and human feedback',
          owner: 'OpenBMB',
          url: 'https://github.com/OpenBMB/XAgent',
          stars: 11200,
          forks: 1300,
          language: 'Python',
          topics: ['ai-agent', 'autonomous', 'tool-use'],
        }
      ];
      
      // Filter results based on the query
      const lowercaseQuery = query.toLowerCase();
      const filteredResults = mockSearchResults.filter(repo => {
        const nameMatch = repo.name.toLowerCase().includes(lowercaseQuery);
        const descMatch = repo.description.toLowerCase().includes(lowercaseQuery);
        const topicMatch = repo.topics.some(topic => topic.includes(lowercaseQuery.replace(/\s+/g, '')));
        
        return nameMatch || descMatch || topicMatch || 
               lowercaseQuery.includes('ai agent') || 
               lowercaseQuery.includes('mcp');
      });
      
      // Convert to Agent objects
      const agents: Agent[] = filteredResults.map(repo => {
        return {
          id: `scrape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: repo.name,
          description: repo.description,
          stars: repo.stars,
          forks: repo.forks,
          url: repo.url,
          owner: repo.owner,
          avatar: `https://github.com/${repo.owner}.png`,
          language: repo.language,
          updated: new Date().toISOString(),
          topics: repo.topics,
          license: 'MIT'
        };
      });
      
      // Return results
      return agents;
    } catch (error) {
      console.error('Error scraping GitHub repositories:', error);
      throw new Error('Failed to scrape GitHub repositories');
    }
  },

  /**
   * Simulate fetching additional repositories for variety
   * @returns Array of Agent objects
   */
  getAdditionalRepositories(): Agent[] {
    const additionalRepos = [
      {
        id: `gen-${Date.now()}-1`,
        name: 'Semantic Kernel',
        description: 'Microsoft framework for integrating AI models into your apps',
        stars: 17500,
        forks: 2400,
        url: 'https://github.com/microsoft/semantic-kernel',
        owner: 'microsoft',
        avatar: 'https://github.com/microsoft.png',
        language: 'C#',
        updated: new Date().toISOString(),
        topics: ['ai', 'sdk', 'llm', 'orchestration'],
        license: 'MIT'
      },
      {
        id: `gen-${Date.now()}-2`,
        name: 'TaskWeaver',
        description: 'A code-first agent framework for seamlessly planning and executing data analytics tasks',
        stars: 8100,
        forks: 930,
        url: 'https://github.com/microsoft/TaskWeaver',
        owner: 'microsoft',
        avatar: 'https://github.com/microsoft.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai', 'agents', 'data-analytics'],
        license: 'MIT'
      },
      {
        id: `gen-${Date.now()}-3`,
        name: 'OpenDevin',
        description: 'Self-improving AI software engineer',
        stars: 31700,
        forks: 3500,
        url: 'https://github.com/OpenDevin/OpenDevin',
        owner: 'OpenDevin',
        avatar: 'https://github.com/OpenDevin.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai-agent', 'software-engineering', 'autonomous'],
        license: 'Apache-2.0'
      }
    ];
    
    return additionalRepos;
  }
};
