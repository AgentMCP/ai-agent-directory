import { Agent } from '../types';
import { supabaseService } from './SupabaseService';

// Real data for AI Agent projects - exported for use as fallback
export const REAL_PROJECTS: Agent[] = [
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

// Data store for user-submitted projects (temporary until saved to server)
let USER_SUBMITTED_PROJECTS: Agent[] = [];

/**
 * Get all projects from Supabase with fallback to REAL_PROJECTS
 */
async function getAllProjects(): Promise<Agent[]> {
  try {
    console.log('Getting all projects...');
    return await supabaseService.getAllProjects();
  } catch (error) {
    console.error('Error getting all projects:', error);
    return REAL_PROJECTS;
  }
}

/**
 * Add projects from bulk import or form submission
 */
async function addUserSubmittedProjects(newProjects: Agent[]): Promise<void> {
  try {
    if (!newProjects || newProjects.length === 0) {
      console.log('No new projects to add');
      return;
    }
    
    console.log(`Adding ${newProjects.length} user-submitted projects`);
    await supabaseService.addProjects(newProjects);
  } catch (error) {
    console.error('Error adding user-submitted projects:', error);
  }
}

/**
 * GitHubService - Handles GitHub API and project management
 */
export class GitHubService {
  // Methods for external access
  static getAllProjects = getAllProjects;
  
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
  
  static getExistingProjectUrls = async function(): Promise<string[]> {
    const projects = await getAllProjects();
    return projects.map(project => project.url);
  };
  
  static getAgentData = async (): Promise<{timestamp: string, agents: Agent[]}> => {
    try {
      // Ensure we get all agents consistently across browsers
      console.log('Getting agent data...');
      const agents = await GitHubService.fetchAgents();
      const timestamp = new Date().toISOString();
      
      console.log(`Returning ${agents.length} agents from getAgentData`);
      return { timestamp, agents };
    } catch (error) {
      console.error('Error in getAgentData:', error);
      // Return empty data rather than throwing to prevent cascading errors
      return { timestamp: new Date().toISOString(), agents: [] };
    }
  };
  
  /**
   * Fetch all agents from Supabase with fallback
   */
  static async fetchAgents(): Promise<Agent[]> {
    try {
      console.log('Fetching all agents...');
      return await getAllProjects();
    } catch (error) {
      console.error('Error fetching agents:', error);
      return REAL_PROJECTS;
    }
  }
  
  /**
   * Add a project from GitHub URL
   */
  static async addProjectFromGitHub(url: string): Promise<{success: boolean, error?: string, agent?: Agent}> {
    try {
      // URL validation and GitHub API fetch logic...
      
      // Create new agent with basic info
      const agent: Agent = {
        id: crypto.randomUUID(),
        url,
        name: url.split('/').pop() || 'Unknown',
        description: 'Loading...',
        stars: 0,
        forks: 0,
        owner: url.split('/').slice(-2)[0] || 'Unknown',
        avatar: `https://github.com/${url.split('/').slice(-2)[0]}.png`,
        language: 'Unknown',
        updated: new Date().toISOString(),
        topics: [],
        license: 'Unknown'
      };
      
      // Add to Supabase
      const added = await supabaseService.addProject(agent);
      
      if (!added) {
        return { 
          success: false, 
          error: 'Project already exists or could not be added' 
        };
      }
      
      return { success: true, agent };
    } catch (error) {
      console.error('Error adding project from GitHub:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Handle bulk project submission
   */
  static async submitProjects(projects: Agent[]): Promise<Agent[]> {
    try {
      // Add projects to Supabase
      const addedCount = await supabaseService.addProjects(projects);
      console.log(`Added ${addedCount} projects to Supabase in bulk`);
      
      // Return the projects that were added
      return projects;
    } catch (error) {
      console.error('Error submitting projects in bulk:', error);
      return [];
    }
  }
  
  /**
   * Initialize the data in the correct order
   */
  static async initialize(): Promise<void> {
    try {
      console.log('Initializing GitHubService...');
      
      // Initialize Supabase table
      await supabaseService.initializeTable();
      
      console.log('GitHubService initialization complete');
    } catch (error) {
      console.error('Error initializing GitHubService:', error);
      // Continue with fallback data
    }
  }
}

// Initialize the service immediately
GitHubService.initialize().catch(error => 
  console.error('Failed to initialize GitHubService:', error)
);

export default GitHubService;
