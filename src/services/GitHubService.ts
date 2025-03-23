import { Agent } from '../types';
import { supabaseService } from './SupabaseService';

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

// Load saved projects from localStorage, but only as a fallback
function loadSavedProjects() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedProjects = window.localStorage.getItem('userSubmittedProjects');
      if (savedProjects) {
        USER_SUBMITTED_PROJECTS = JSON.parse(savedProjects);
        console.log(`Loaded ${USER_SUBMITTED_PROJECTS.length} user-submitted projects from localStorage`);
        
        // Migrate projects to Supabase (only happens once)
        migrateProjectsToSupabase(USER_SUBMITTED_PROJECTS);
      }
    } catch (error) {
      console.error('Error loading saved projects:', error);
    }
  }
}

// We no longer need to save projects to localStorage
// This is kept for compatibility but will be phased out
function saveProjects() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('userSubmittedProjects', JSON.stringify(USER_SUBMITTED_PROJECTS));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }
}

// Migrate existing localStorage projects to Supabase
async function migrateProjectsToSupabase(projects: Agent[]) {
  if (projects.length === 0) return;
  
  console.log(`Migrating ${projects.length} projects from localStorage to Supabase`);
  await supabaseService.addProjects(projects);
  console.log('Migration to Supabase complete');
}

// Initialize by loading saved projects and migrating them to server storage
loadSavedProjects();

// Function to remove duplicates from an array of projects
function removeDuplicates(projects: Agent[]): Agent[] {
  const urlMap = new Map<string, Agent>();
  
  for (const project of projects) {
    if (project.url && !urlMap.has(project.url)) {
      urlMap.set(project.url, project);
    }
  }
  
  return Array.from(urlMap.values());
}

// Get all projects from all sources
async function getAllProjects(): Promise<Agent[]> {
  try {
    // First try to get projects from Supabase
    const supabaseProjects = await supabaseService.getAllProjects();
    
    // If Supabase has projects, return those
    if (supabaseProjects.length > 0) {
      console.log(`Found ${supabaseProjects.length} projects in Supabase`);
      return supabaseProjects;
    }
    
    // Fallback to local data if Supabase is empty
    const allProjects = [...REAL_PROJECTS, ...USER_SUBMITTED_PROJECTS];
    
    // Remove duplicates
    const uniqueProjects = removeDuplicates(allProjects);
    console.log(`Returning ${uniqueProjects.length} combined projects (local fallback)`);
    
    // Save these to Supabase for next time
    supabaseService.addProjects(uniqueProjects);
    
    return uniqueProjects;
  } catch (error) {
    console.error('Error getting all projects:', error);
    // Ultimate fallback to local data only
    return [...REAL_PROJECTS, ...USER_SUBMITTED_PROJECTS];
  }
}

// Add projects from bulk import or form submission
async function addUserSubmittedProjects(newProjects: Agent[]) {
  try {
    // Add to Supabase first
    const addedCount = await supabaseService.addProjects(newProjects);
    console.log(`Added ${addedCount} projects to Supabase`);
    
    // Also add to local storage as backup
    for (const project of newProjects) {
      if (!USER_SUBMITTED_PROJECTS.some(p => p.url === project.url)) {
        USER_SUBMITTED_PROJECTS.push(project);
      }
    }
    
    // Save to localStorage as backup
    saveProjects();
    
    return addedCount;
  } catch (error) {
    console.error('Error adding user-submitted projects:', error);
    return 0;
  }
}

export class GitHubService {
  // Use our getAllProjects function
  static getAllProjects = getAllProjects;
  
  // Add a single project by URL
  static addProject = async function(url: string): Promise<{success: boolean, error?: string, agent?: Agent}> {
    return GitHubService.addProjectFromGitHub(url);
  }
  
  // Bulk add projects by URL
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
  }
  
  // Get all existing project URLs
  static getExistingProjectUrls = async function(): Promise<string[]> {
    const projects = await getAllProjects();
    return projects.map(project => project.url);
  }
  
  // Get all agent data
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
  }
  
  // Fetch all agents from Supabase or fallback sources
  static async fetchAgents(): Promise<Agent[]> {
    try {
      console.log('Fetching agents from all sources...');
      
      // Try to get projects from Supabase first
      try {
        const supabaseProjects = await supabaseService.getAllProjects();
        if (supabaseProjects && supabaseProjects.length > 0) {
          console.log(`Got ${supabaseProjects.length} projects from Supabase`);
          return supabaseProjects;
        }
      } catch (supabaseError) {
        console.warn('Failed to fetch from Supabase, using local data:', supabaseError);
        // Fall through to use other sources
      }
      
      // Fall back to combining real and user-submitted projects
      try {
        console.log('Falling back to local data sources...');
        const allProjects = await getAllProjects();
        console.log(`Returning ${allProjects.length} projects from local sources`);
        return allProjects;
      } catch (localError) {
        console.error('Failed to get projects from local sources:', localError);
      }
      
      // Last resort: just return the predefined REAL_PROJECTS
      console.log(`Last resort fallback: returning ${REAL_PROJECTS.length} predefined REAL_PROJECTS`);
      return [...REAL_PROJECTS];
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      // Always return something to prevent cascading errors
      return [...REAL_PROJECTS];
    }
  }
  
  // Search for agents by query
  static async searchAgents(query: string): Promise<Agent[]> {
    try {
      console.log(`Searching for agents with query: "${query}"`);
      
      if (!query || query.trim() === '') {
        return GitHubService.fetchAgents();
      }
      
      // Try to search in Supabase first
      try {
        const supabaseResults = await supabaseService.searchProjects(query);
        if (supabaseResults.length > 0) {
          console.log(`Found ${supabaseResults.length} matching agents in Supabase`);
          return supabaseResults;
        }
      } catch (supabaseError) {
        console.error('Supabase search failed, using local search:', supabaseError);
      }
      
      // Fallback to local search
      const agents = await GitHubService.fetchAgents();
      const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
      
      // Match ANY term (not ALL terms) for better results
      const results = agents.filter(agent => {
        const searchableText = [
          agent.name?.toLowerCase() || '',
          agent.description?.toLowerCase() || '',
          agent.language?.toLowerCase() || '',
          agent.owner?.toLowerCase() || '',
          ...(agent.topics?.map(t => t.toLowerCase()) || [])
        ].join(' ');
        
        // Check if ANY search term matches
        return searchTerms.some(term => searchableText.includes(term));
      });
      
      console.log(`Local search found ${results.length} matching agents`);
      return results;
    } catch (error) {
      console.error('Error searching agents:', error);
      return [];
    }
  }
  
  // Helper method to calculate search relevance score
  static calculateRelevance(agent: Agent, searchTerms: string[]): number {
    let score = 0;
    const fields = [
      { text: agent.name?.toLowerCase() || '', weight: 3 },
      { text: agent.description?.toLowerCase() || '', weight: 2 },
      { text: agent.owner?.toLowerCase() || '', weight: 1 },
      { text: agent.language?.toLowerCase() || '', weight: 1 },
      { text: (agent.topics || []).join(' ').toLowerCase(), weight: 2 }
    ];
    
    for (const term of searchTerms) {
      for (const field of fields) {
        if (field.text.includes(term)) {
          score += field.weight;
        }
      }
    }
    
    return score;
  }
  
  // Get last updated timestamp
  static getLastUpdatedTimestamp(): string {
    return new Date().toISOString();
  }
  
  // Format last updated timestamp for display
  static formatLastUpdated(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Unknown';
    }
  }
  
  // Refresh agent data
  static async refreshAgentData(): Promise<{timestamp: string, agents: Agent[]}> {
    try {
      // Get fresh data from all sources
      const agents = await getAllProjects();
      const timestamp = GitHubService.getLastUpdatedTimestamp();
      
      // Save data to Supabase
      await supabaseService.addProjects(agents);
      
      return { timestamp, agents };
    } catch (error) {
      console.error('Error refreshing agent data:', error);
      return { timestamp: GitHubService.getLastUpdatedTimestamp(), agents: [] };
    }
  }
  
  // Get top AI agent and MCP projects
  static async getTopAgentMcpProjects(): Promise<Agent[]> {
    try {
      const allAgents = await GitHubService.fetchAgents();
      
      // Sort by stars and take top 20
      return allAgents
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting top projects:', error);
      return [];
    }
  }
  
  // Helper method to detect non-English characters
  static containsNonEnglishCharacters(text: string | null | undefined): boolean {
    if (!text) return false;
    
    // This regex matches characters outside the basic Latin alphabet
    const nonEnglishRegex = /[^\x00-\x7F]/;
    return nonEnglishRegex.test(text);
  }
  
  // Add a project from GitHub URL
  static async addProjectFromGitHub(url: string): Promise<{success: boolean, error?: string, agent?: Agent}> {
    console.log(`Adding project from GitHub URL: ${url}`);
    
    try {
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
      
      // We would fetch more details from GitHub API here
      // For now, just add the basic project
      
      // Add to Supabase
      const added = await supabaseService.addProject(agent);
      
      if (!added) {
        return { 
          success: false, 
          error: 'Project already exists or could not be added' 
        };
      }
      
      // Also add to local storage as backup
      if (!USER_SUBMITTED_PROJECTS.some(p => p.url === url)) {
        USER_SUBMITTED_PROJECTS.push(agent);
        saveProjects();
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
  
  // Add new method to handle bulk project submission
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
  
  // Method to initialize the data in the correct order
  static async initialize(): Promise<void> {
    try {
      console.log('Initializing GitHubService...');
      
      // Try to initialize Supabase but don't let errors stop the process
      try {
        await supabaseService.initializeTable();
      } catch (error) {
        console.warn('Supabase initialization failed, continuing with local data:', error);
        // Continue anyway - we'll fall back to local data
      }
      
      // Get projects from all sources, with error handling
      try {
        const projects = await getAllProjects();
        
        // Make sure they're all in Supabase
        if (projects.length > 0) {
          try {
            await supabaseService.addProjects(projects);
          } catch (supabaseError) {
            console.warn('Failed to add projects to Supabase during initialization, using local storage:', supabaseError);
            // Continue with local data
          }
        }
      } catch (getProjectsError) {
        console.warn('Failed to get all projects during initialization:', getProjectsError);
        // Continue with whatever data we have
      }
      
      console.log('GitHubService initialization complete');
    } catch (error) {
      console.error('Error initializing GitHubService:', error);
      // Don't rethrow - we want to continue even if initialization fails
    }
  }
}

// Initialize the service immediately
GitHubService.initialize().catch(error => 
  console.error('Failed to initialize GitHubService:', error)
);

export { REAL_PROJECTS };
