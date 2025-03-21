import { Agent } from '../types';

// Real data for AI Agent projects
const REAL_PROJECTS: Agent[] = [
  {
    id: '1',
    name: 'Auto-GPT',
    description: 'An experimental open-source autonomous AI agent that can perform tasks without human intervention',
    stars: 153000,
    forks: 39200,
    url: 'https://github.com/Significant-Gravitas/Auto-GPT',
    owner: 'Significant-Gravitas',
    avatar: 'https://avatars.githubusercontent.com/u/121312449?v=4',
    language: 'Python',
    updated: '2024-05-15',
    topics: ['ai', 'agents', 'autonomous', 'gpt', 'openai'],
    license: 'MIT'
  },
  {
    id: '2',
    name: 'BabyAGI',
    description: 'An AI-powered task management system that uses the OpenAI API and vector databases',
    stars: 17700,
    forks: 2700,
    url: 'https://github.com/yoheinakajima/babyagi',
    owner: 'yoheinakajima',
    avatar: 'https://avatars.githubusercontent.com/u/843222?v=4',
    language: 'Python',
    updated: '2024-04-20',
    topics: ['ai', 'agi', 'autonomous-agents', 'python'],
    license: 'MIT'
  },
  {
    id: '3',
    name: 'AgentGPT',
    description: 'Deploy autonomous AI Agents on your browser',
    stars: 28100,
    forks: 5100,
    url: 'https://github.com/reworkd/AgentGPT',
    owner: 'reworkd',
    avatar: 'https://avatars.githubusercontent.com/u/127366769?v=4',
    language: 'TypeScript',
    updated: '2024-05-10',
    topics: ['ai', 'web', 'gpt', 'agents', 'autonomous'],
    license: 'GPL-3.0'
  },
  {
    id: '4',
    name: 'LangChain',
    description: 'Building applications with LLMs through composability',
    stars: 77000,
    forks: 12200,
    url: 'https://github.com/langchain-ai/langchain',
    owner: 'langchain-ai',
    avatar: 'https://avatars.githubusercontent.com/u/126733545?v=4',
    language: 'Python',
    updated: '2024-05-18',
    topics: ['llm', 'ai', 'language-model', 'agents'],
    license: 'MIT'
  },
  {
    id: '5',
    name: 'OpenDevin',
    description: 'Self-improving AI software engineer',
    stars: 31700,
    forks: 3500,
    url: 'https://github.com/OpenDevin/OpenDevin',
    owner: 'OpenDevin',
    avatar: 'https://avatars.githubusercontent.com/u/162292220?v=4',
    language: 'Python',
    updated: '2024-05-17',
    topics: ['ai-agent', 'software-engineering', 'autonomous'],
    license: 'Apache-2.0'
  },
  {
    id: '6',
    name: 'CrewAI',
    description: 'Framework for orchestrating role-playing autonomous AI agents',
    stars: 19800,
    forks: 2300,
    url: 'https://github.com/joaomdmoura/crewAI',
    owner: 'joaomdmoura',
    avatar: 'https://avatars.githubusercontent.com/u/138756?v=4',
    language: 'Python',
    updated: '2024-05-12',
    topics: ['ai', 'agents', 'collaborative', 'framework'],
    license: 'MIT'
  },
  {
    id: '7',
    name: 'SuperAGI',
    description: 'An open-source autonomous AI agent framework',
    stars: 13700,
    forks: 1700,
    url: 'https://github.com/TransformerOptimus/SuperAGI',
    owner: 'TransformerOptimus',
    avatar: 'https://avatars.githubusercontent.com/u/133493246?v=4',
    language: 'Python',
    updated: '2024-05-11',
    topics: ['agi', 'autonomous-agents', 'framework'],
    license: 'MIT'
  },
  {
    id: '8',
    name: 'Haystack',
    description: 'LLM orchestration framework for building NLP applications',
    stars: 13900,
    forks: 1800,
    url: 'https://github.com/deepset-ai/haystack',
    owner: 'deepset-ai',
    avatar: 'https://avatars.githubusercontent.com/u/51827949?v=4',
    language: 'Python',
    updated: '2024-05-19',
    topics: ['llm', 'rag', 'agents', 'nlp'],
    license: 'Apache-2.0'
  },
  {
    id: '9',
    name: 'LlamaIndex',
    description: 'Data framework for building LLM applications with complex data',
    stars: 33600,
    forks: 4100,
    url: 'https://github.com/run-llama/llama_index',
    owner: 'run-llama',
    avatar: 'https://avatars.githubusercontent.com/u/122293974?v=4',
    language: 'Python',
    updated: '2024-05-21',
    topics: ['llm', 'rag', 'ai', 'data-framework'],
    license: 'MIT'
  },
  {
    id: '10',
    name: 'MetaGPT',
    description: 'The Multi-Agent Framework: Given one line requirement, generate PRD, design, tasks, and repo',
    stars: 35200,
    forks: 4200,
    url: 'https://github.com/geekan/MetaGPT',
    owner: 'geekan',
    avatar: 'https://avatars.githubusercontent.com/u/2747893?v=4',
    language: 'Python',
    updated: '2024-05-19',
    topics: ['agents', 'multi-agent', 'ai', 'llm'],
    license: 'MIT'
  },
  {
    id: '11',
    name: 'XAgent',
    description: 'An Autonomous AI Agent for complex task-solving with tool-use and human feedback',
    stars: 11200,
    forks: 1300,
    url: 'https://github.com/OpenBMB/XAgent',
    owner: 'OpenBMB',
    avatar: 'https://avatars.githubusercontent.com/u/89198042?v=4',
    language: 'Python',
    updated: '2024-05-01',
    topics: ['ai-agent', 'autonomous', 'tool-use', 'llm'],
    license: 'Apache-2.0'
  },
  {
    id: '12',
    name: 'ChatDev',
    description: 'Create customized software using natural language',
    stars: 20200,
    forks: 2100,
    url: 'https://github.com/OpenBMB/ChatDev',
    owner: 'OpenBMB',
    avatar: 'https://avatars.githubusercontent.com/u/89198042?v=4',
    language: 'Python',
    updated: '2024-04-25',
    topics: ['software-development', 'llm', 'ai-agent'],
    license: 'Apache-2.0'
  },
  {
    id: '13',
    name: 'MLC LLM',
    description: 'Run large language models locally on phones, laptops, and edge devices',
    stars: 14200,
    forks: 1600,
    url: 'https://github.com/mlc-ai/mlc-llm',
    owner: 'mlc-ai',
    avatar: 'https://avatars.githubusercontent.com/u/103401051?v=4',
    language: 'C++',
    updated: '2024-05-16',
    topics: ['llm', 'edge-computing', 'optimization'],
    license: 'Apache-2.0'
  },
  {
    id: '14',
    name: 'Llama.cpp',
    description: 'Port of Facebook\'s LLaMA model in C/C++',
    stars: 51300,
    forks: 7800,
    url: 'https://github.com/ggerganov/llama.cpp',
    owner: 'ggerganov',
    avatar: 'https://avatars.githubusercontent.com/u/1991296?v=4',
    language: 'C++',
    updated: '2024-05-21',
    topics: ['llm', 'ai', 'language-model', 'cpp'],
    license: 'MIT'
  },
  {
    id: '15',
    name: 'Ollama',
    description: 'Get up and running with Llama 2, Mistral, and other large language models locally',
    stars: 49200,
    forks: 3600,
    url: 'https://github.com/ollama/ollama',
    owner: 'ollama',
    avatar: 'https://avatars.githubusercontent.com/u/129885431?v=4',
    language: 'Go',
    updated: '2024-05-21',
    topics: ['llm', 'local', 'language-model', 'inference'],
    license: 'MIT'
  }
];

// Data store for user-submitted projects
let USER_SUBMITTED_PROJECTS: Agent[] = [];

// Load saved projects from localStorage on initialization
const loadSavedProjects = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedProjects = localStorage.getItem('userSubmittedProjects');
      if (savedProjects) {
        USER_SUBMITTED_PROJECTS = JSON.parse(savedProjects);
        console.log('Loaded saved projects:', USER_SUBMITTED_PROJECTS.length);
      } else {
        console.log('No saved projects found in localStorage');
        USER_SUBMITTED_PROJECTS = [];
      }
    }
  } catch (error) {
    console.error('Error loading saved projects:', error);
    USER_SUBMITTED_PROJECTS = [];
  }
};

// Save projects to localStorage
const saveProjects = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('userSubmittedProjects', JSON.stringify(USER_SUBMITTED_PROJECTS));
    }
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

// Initialize by loading saved projects
loadSavedProjects();

// Function to remove duplicates from an array of projects
const removeDuplicates = (projects: Agent[]): Agent[] => {
  const uniqueProjects: Agent[] = [];
  
  for (const project of projects) {
    if (!uniqueProjects.some(existingProject => 
      (existingProject.url && project.url && existingProject.url.toLowerCase() === project.url.toLowerCase()) ||
      (existingProject.name && project.name && existingProject.owner && project.owner && 
       existingProject.name.toLowerCase() === project.name.toLowerCase() && 
       existingProject.owner.toLowerCase() === project.owner.toLowerCase())
    )) {
      uniqueProjects.push(project);
    }
  }
  
  return uniqueProjects;
};

// Combine all projects
const getAllProjects = () => {
  // Get user-submitted projects from localStorage
  let userProjects: Agent[] = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedProjects = localStorage.getItem('userSubmittedProjects');
      if (savedProjects) {
        userProjects = JSON.parse(savedProjects);
      }
    }
  } catch (error) {
    console.error('Error loading saved projects in getAllProjects:', error);
  }
  
  // Combine all projects and remove duplicates
  const allProjects = [...REAL_PROJECTS, ...USER_SUBMITTED_PROJECTS, ...userProjects];
  return removeDuplicates(allProjects);
};

class GitHubService {
  static getAllProjects = getAllProjects;

  static fetchAgents(): Promise<Agent[]> {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          // Get all projects and filter out non-English ones
          const allProjects = getAllProjects();
          const englishProjects = allProjects.filter(agent => 
            !this.containsNonEnglishCharacters(agent.name) && 
            !this.containsNonEnglishCharacters(agent.description)
          );
          console.log(`Fetched ${englishProjects.length} agents from ${allProjects.length} total`);
          resolve(englishProjects);
        }, 500);
      } catch (error) {
        console.error('Error in fetchAgents:', error);
        reject(error);
      }
    });
  }

  static searchAgents(query: string): Promise<Agent[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedQuery = query.toLowerCase().trim();
        
        // If query is empty, return all agents
        if (!normalizedQuery) {
          resolve(getAllProjects().filter(agent => 
            !this.containsNonEnglishCharacters(agent.name) && 
            !this.containsNonEnglishCharacters(agent.description)
          ));
          return;
        }
        
        // Split the query into individual terms for better matching
        const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
        
        // Filter agents based on search terms
        const results = getAllProjects().filter(agent => {
          // First check if the repository is in English
          if (this.containsNonEnglishCharacters(agent.name) || 
              this.containsNonEnglishCharacters(agent.description)) {
            return false;
          }
          
          // Convert agent data to lowercase for case-insensitive matching
          const name = agent.name.toLowerCase();
          const description = agent.description.toLowerCase();
          const topics = agent.topics.map(t => t.toLowerCase());
          
          // Check if any search term matches any field
          // For multi-term queries, require at least one match for each term
          return searchTerms.every(term => 
            name.includes(term) || 
            description.includes(term) || 
            topics.some(topic => topic.includes(term))
          );
        });
        
        // Sort results by relevance (number of term matches)
        const sortedResults = results.sort((a, b) => {
          const aRelevance = this.calculateRelevance(a, searchTerms);
          const bRelevance = this.calculateRelevance(b, searchTerms);
          return bRelevance - aRelevance;
        });
        
        // Log the search results for debugging
        console.log(`Search for "${query}" found ${sortedResults.length} results`);
        
        resolve(sortedResults);
      }, 300);
    });
  }
  
  // Helper method to calculate search relevance score
  private static calculateRelevance(agent: Agent, searchTerms: string[]): number {
    const name = agent.name.toLowerCase();
    const description = agent.description.toLowerCase();
    const topics = agent.topics.map(t => t.toLowerCase());
    
    let score = 0;
    
    // Check each search term
    for (const term of searchTerms) {
      // Name matches are most important
      if (name.includes(term)) {
        score += 10;
        // Exact name match or starts with term gets bonus points
        if (name === term || name.startsWith(term + ' ')) {
          score += 15;
        }
      }
      
      // Description matches
      if (description.includes(term)) {
        score += 5;
      }
      
      // Topic matches
      if (topics.some(topic => topic.includes(term))) {
        score += 8;
      }
      
      // Stars and forks add to relevance
      score += Math.min(agent.stars / 100, 10); // Cap at 10 points
      score += Math.min(agent.forks / 20, 5);   // Cap at 5 points
    }
    
    return score;
  }

  static getLastUpdatedTimestamp(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('lastAgentRefresh') || new Date().toISOString();
    } else {
      return new Date().toISOString();
    }
  }

  static formatLastUpdated(timestamp: string): string {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static refreshAgentData(): Promise<{timestamp: string, agents: Agent[]}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const refreshedAgents = getAllProjects();
        const timestamp = new Date().toISOString();
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('lastAgentRefresh', timestamp);
        }
        resolve({ timestamp, agents: refreshedAgents });
      }, 1000);
    });
  }

  static getTopAgentMcpProjects(): Promise<Agent[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter for projects explicitly related to AI Agents or MCP
        const agentMcpProjects = getAllProjects().filter(agent => {
          // Check if the repository is in English by examining name and description
          if (this.containsNonEnglishCharacters(agent.name) || this.containsNonEnglishCharacters(agent.description)) {
            return false;
          }
          
          const topics = agent.topics.map(topic => topic.toLowerCase());
          const nameAndDesc = (agent.name + ' ' + agent.description).toLowerCase();
          
          // More specific agent-related keywords
          const agentKeywords = [
            'ai agent', 'ai-agent', 'aiagent',
            'llm agent', 'llm-agent', 'llmagent',
            'autonomous agent', 'agent framework',
            'agent-framework', 'agent orchestration',
            'agent-orchestration', 'ai assistant',
            'ai-assistant', 'llm framework',
            'agent system', 'multi-agent',
            'multiagent', 'agent communication'
          ];
          
          // MCP-related keywords
          const mcpKeywords = [
            'mcp', 'model context protocol',
            'context protocol', 'context orchestration',
            'model orchestration', 'context handling',
            'agent communication', 'agent protocol',
            'model context', 'context window',
            'context framework', 'agent interoperability',
            'agent communication protocol',
            'model integration'
          ];
          
          // Check if any of the keywords are present in topics or name/description
          const hasAgentKeyword = agentKeywords.some(keyword => 
            topics.some(t => t.includes(keyword)) || nameAndDesc.includes(keyword)
          );
          
          const hasMcpKeyword = mcpKeywords.some(keyword => 
            topics.some(t => t.includes(keyword)) || nameAndDesc.includes(keyword)
          );
          
          return hasAgentKeyword || hasMcpKeyword;
        });
        
        // Sort by stars descending
        const topProjects = [...agentMcpProjects]
          .sort((a, b) => b.stars - a.stars)
          .slice(0, 10);
          
        resolve(topProjects);
      }, 300);
    });
  }
  
  // Helper method to detect non-English characters
  static containsNonEnglishCharacters(text: string | null | undefined): boolean {
    if (!text) return false; // Empty text is considered valid English
    
    // Common non-English character ranges (Unicode blocks)
    const nonEnglishPatterns = [
      /[\u4E00-\u9FFF]/,  // Chinese
      /[\u3040-\u309F\u30A0-\u30FF]/,  // Japanese
      /[\uAC00-\uD7AF]/,  // Korean
      /[\u0400-\u04FF]/,  // Cyrillic (Russian)
      /[\u0600-\u06FF]/,  // Arabic
      /[\u0900-\u097F]/   // Devanagari
    ];
    
    // Check if text contains ANY non-English characters - stricter filtering
    for (const pattern of nonEnglishPatterns) {
      if (pattern.test(text)) {
        // If ANY non-English characters are found, consider it non-English
        return true;
      }
    }
    
    // Additional check for repositories with mixed language content
    // Check if the text has a high ratio of non-ASCII characters
    const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
    const textLength = text.length;
    
    // If more than 10% of characters are non-ASCII, consider it non-English
    if (textLength > 0 && nonAsciiCount / textLength > 0.1) {
      return true;
    }
    
    return false;
  }

  static addProjectFromGitHub(url: string): Promise<{success: boolean, error?: string, agent?: Agent}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Extract owner and repo name from GitHub URL
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          
          if (pathParts.length < 2 || !url.includes('github.com')) {
            resolve({
              success: false,
              error: 'Invalid GitHub URL format. Please use https://github.com/owner/repo'
            });
            return;
          }
          
          const owner = pathParts[0];
          const repoName = pathParts[1];
          
          // Check if project already exists
          const existingProject = getAllProjects().find(
            project => project.url.toLowerCase() === url.toLowerCase() || 
                      (project.owner.toLowerCase() === owner.toLowerCase() && 
                       project.name.toLowerCase() === repoName.toLowerCase())
          );
          
          if (existingProject) {
            resolve({
              success: false,
              error: 'This project is already in the directory'
            });
            return;
          }
          
          // In a real implementation, we would fetch data from GitHub API
          // For this demo, we'll create a simulated project with the provided URL
          
          // Simulate checking if description contains 'AI agent' or 'MCP'
          // In real implementation, we would fetch repo description from GitHub API
          const randomDescriptions = [
            'An AI agent project for intelligent task automation',
            'MCP-based framework for autonomous agents',
            'Experimental AI agent for natural language processing',
            'Machine learning framework with agent capabilities',
            'AI multi-agent system for distributed problem solving'
          ];
          
          const description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
          
          // Generate random stats for demonstration
          const stars = Math.floor(Math.random() * 5000);
          const forks = Math.floor(Math.random() * 1000);
          
          // Create new agent entry
          const newAgent: Agent = {
            id: `user-${Date.now()}`,
            name: repoName,
            description,
            stars,
            forks,
            url,
            owner,
            avatar: `https://github.com/${owner}.png`,
            language: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'][Math.floor(Math.random() * 5)],
            updated: new Date().toISOString(),
            topics: ['ai', 'agent', 'machine-learning', 'autonomous', 'mcp'].sort(() => Math.random() - 0.5).slice(0, 3),
            license: 'MIT'
          };
          
          // Add to user submitted projects
          USER_SUBMITTED_PROJECTS.push(newAgent);
          if (typeof window !== 'undefined' && window.localStorage) {
            saveProjects();
          }
          
          resolve({
            success: true,
            agent: newAgent
          });
        } catch (error) {
          console.error('Error adding project:', error);
          resolve({
            success: false,
            error: 'Failed to add project. Please try again.'
          });
        }
      }, 800);
    });
  }

  static addProject = async function(url: string): Promise<{success: boolean, error?: string, agent?: Agent}> {
    return GitHubService.addProjectFromGitHub(url);
  };

  static addProjects = async function(urls: string[]): Promise<{url: string, success: boolean, error?: string}[]> {
    const results = [];
    
    for (const url of urls) {
      try {
        const result = await GitHubService.addProjectFromGitHub(url);
        results.push({
          url,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  };

  static getExistingProjectUrls = function(): string[] {
    return getAllProjects().map(project => project.url);
  };

  static getAgentData = async (): Promise<{timestamp: string, agents: Agent[]}> => {
    try {
      const agents = await GitHubService.fetchAgents();
      const timestamp = new Date().toISOString();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('lastAgentRefresh', timestamp);
      }
      return { timestamp, agents };
    } catch (error) {
      console.error('Error in getAgentData:', error);
      // Return empty data rather than throwing to prevent cascading errors
      return { timestamp: new Date().toISOString(), agents: [] };
    }
  };
}

export { GitHubService };
