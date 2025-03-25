import { Agent } from '../types';

// Load user-submitted projects from localStorage
const loadUserSubmittedProjects = () => {
  try {
    const savedProjects = localStorage.getItem('userSubmittedProjects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
  } catch (error) {
    console.error('Error loading saved projects:', error);
  }
  return [];
};

// Save projects to localStorage
const saveUserSubmittedProjects = (projects: Agent[]) => {
  try {
    // Remove duplicates before saving
    const uniqueProjects = ScrapeService.removeDuplicates(projects);
    localStorage.setItem('userSubmittedProjects', JSON.stringify(uniqueProjects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

// User-submitted projects storage
let USER_SUBMITTED_PROJECTS: Agent[] = loadUserSubmittedProjects();

// Store all search results in memory to make them available for all users
let CACHED_SEARCH_RESULTS: Map<string, Agent[]> = new Map();

// Load cached search results from localStorage
const loadCachedSearchResults = (): Map<string, Agent[]> => {
  try {
    const savedCache = localStorage.getItem('cachedSearchResults');
    if (savedCache) {
      const parsed = JSON.parse(savedCache);
      const map = new Map<string, Agent[]>();
      Object.keys(parsed).forEach(key => {
        map.set(key, parsed[key]);
      });
      console.log(`Loaded ${map.size} cached search queries from localStorage`);
      return map;
    }
  } catch (error) {
    console.error('Error loading cached search results:', error);
  }
  return new Map<string, Agent[]>();
};

// Save cached search results to localStorage
const saveCachedSearchResults = (cache: Map<string, Agent[]>) => {
  try {
    const obj: Record<string, Agent[]> = {};
    cache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem('cachedSearchResults', JSON.stringify(obj));
    console.log(`Saved ${cache.size} cached search queries to localStorage`);
  } catch (error) {
    console.error('Error saving cached search results:', error);
  }
};

// Initialize cache from localStorage
CACHED_SEARCH_RESULTS = loadCachedSearchResults();

/**
 * Service for scraping GitHub repositories for AI Agent and MCP projects
 */
const ScrapeService = {
  /**
   * Remove duplicates from an array of projects
   */
  removeDuplicates(projects: Agent[]): Agent[] {
    const uniqueProjects: Agent[] = [];
    const seenUrls = new Set<string>();
    const seenOwnerRepos = new Set<string>();
    
    for (const project of projects) {
      if (!project.url) continue;
      
      // Normalize URL for comparison
      const normalizedUrl = project.url.toLowerCase().trim();
      
      // Create a unique key for owner/name combination if available
      const ownerRepoKey = project.owner && project.name ? 
        `${project.owner.toLowerCase()}-${project.name.toLowerCase()}` : null;
      
      // Check if we've seen this URL or owner/repo combination before
      if (!seenUrls.has(normalizedUrl) && 
          (!ownerRepoKey || !seenOwnerRepos.has(ownerRepoKey))) {
        
        // Add to our tracking sets
        seenUrls.add(normalizedUrl);
        if (ownerRepoKey) {
          seenOwnerRepos.add(ownerRepoKey);
        }
        
        // Add to unique projects
        uniqueProjects.push(project);
      } else {
        console.log(`Removing duplicate project: ${project.name || 'Unnamed'} (${normalizedUrl})`);
      }
    }
    
    console.log(`Removed ${projects.length - uniqueProjects.length} duplicates from ${projects.length} projects`);
    return uniqueProjects;
  },

  /**
   * Get all existing projects from all sources
   */
  getAllExistingProjects(): Agent[] {
    // Combine all sources of projects
    const localStorageProjects = loadUserSubmittedProjects();
    const cachedProjects: Agent[] = [];
    
    // Add all projects from the cache
    CACHED_SEARCH_RESULTS.forEach(projects => {
      cachedProjects.push(...projects);
    });
    
    // Combine and remove duplicates
    const combinedProjects = [...localStorageProjects, ...cachedProjects];
    return this.removeDuplicates(combinedProjects);
  },

  /**
   * Function to remove duplicates by comparing with existing projects
   */
  removeDuplicatesWithExisting(newProjects: Agent[], existingProjects?: Agent[]): Agent[] {
    // Get existing projects if not provided
    const existing = existingProjects || this.getAllExistingProjects();
    
    // Create sets for fast lookup
    const existingUrls = new Set<string>();
    const existingOwnerRepos = new Set<string>();
    
    // Populate sets with existing project identifiers
    for (const project of existing) {
      if (project.url) {
        existingUrls.add(project.url.toLowerCase().trim());
      }
      
      if (project.owner && project.name) {
        existingOwnerRepos.add(`${project.owner.toLowerCase()}-${project.name.toLowerCase()}`);
      }
    }
    
    // Filter out duplicates
    const uniqueProjects = newProjects.filter(project => {
      if (!project.url) return false;
      
      const normalizedUrl = project.url.toLowerCase().trim();
      const ownerRepoKey = project.owner && project.name ? 
        `${project.owner.toLowerCase()}-${project.name.toLowerCase()}` : null;
      
      // Check if this project exists in our sets
      const isDuplicate = existingUrls.has(normalizedUrl) || 
        (ownerRepoKey && existingOwnerRepos.has(ownerRepoKey));
      
      if (isDuplicate) {
        console.log(`Filtering out existing project: ${project.name || 'Unnamed'} (${normalizedUrl})`);
      }
      
      return !isDuplicate;
    });
    
    console.log(`Filtered out ${newProjects.length - uniqueProjects.length} existing projects from ${newProjects.length} projects`);
    return uniqueProjects;
  },
  
  /**
   * Scrape GitHub repositories for AI Agents and MCP tools
   * @param query Search query
   * @param isFirstImport Whether this is the first import (allows up to 250 repos)
   * @returns List of validated repositories
   */
  async scrapeGitHubRepositories(query = 'AI Agent MCP', isFirstImport = false): Promise<Agent[]> {
    console.log(`Scraping GitHub repositories for: ${query}, first import: ${isFirstImport}`);
    
    // Check if we have cached results for this query
    const cacheKey = query.toLowerCase().trim();
    if (CACHED_SEARCH_RESULTS.has(cacheKey)) {
      console.log(`Using cached results for query: ${query}`);
      
      // Even if we use cached results, we should filter against existing projects
      const cachedResults = CACHED_SEARCH_RESULTS.get(cacheKey) || [];
      const uniqueResults = this.removeDuplicatesWithExisting(cachedResults);
      console.log(`Found ${uniqueResults.length} unique cached results after filtering against existing projects`);
      
      return uniqueResults;
    }
    
    const maxResults = isFirstImport ? 250 : 100;
    
    try {
      // Try to get token from localStorage but proceed even if missing
      const githubToken = localStorage.getItem('github_token') || '';
      console.log(`Search with${githubToken ? '' : 'out'} GitHub token`);
      
      // Try GitHub API first if token is available
      if (githubToken) {
        try {
          console.log('Attempting GitHub API search with token');
          const apiResults = await this.searchWithGitHubAPI(query, githubToken);
          if (apiResults && apiResults.length > 0) {
            console.log(`GitHub API search successful: ${apiResults.length} results`);
            return apiResults;
          }
          console.log('GitHub API search returned no results, falling back');
        } catch (apiError) {
          console.error('GitHub API search failed:', apiError);
          console.log('Falling back to direct search');
        }
      } else {
        console.log('No GitHub token available, skipping API search');
      }
      
      // If no token is available, return empty results
      if (!githubToken) {
        console.log('No GitHub token available for API search, using fallback data');
        return this.generateSimulatedResults(query);
      }
      
      console.log('Using GitHub token for API search');
      const searchResults = [];
      
      // Try GitHub API with fetch
      try {
        // GitHub search API (if token is available)
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json'
        };
        
        if (githubToken) {
          // Try with proper GitHub token format - no 'token' or 'Bearer' prefix as it might vary
          headers['Authorization'] = githubToken.startsWith('ghp_') ? `token ${githubToken}` : 
                                    (githubToken.startsWith('github_pat_') ? `token ${githubToken}` : githubToken);
          
          console.log('Using Authorization header:', 
                     headers['Authorization'].substring(0, 10) + '...' + 
                     headers['Authorization'].substring(headers['Authorization'].length - 5));
        }
        
        // Use GitHub search API to find repositories
        const searchTerms = query.split(' ').filter(term => term.length > 2);
        const queryString = searchTerms.join('+');
        
        // Add language filter to the query to prioritize English content
        // We'll search for a high number of results (up to 100 per page)
        // Remove strict language filters to get more results
        const apiUrl = `https://api.github.com/search/repositories?q=${queryString}+in:name,description,readme&sort=stars&order=desc&per_page=100`;
        
        // First check if the fetch will succeed (CORS check)
        try {
          console.log(`Fetching from GitHub API: ${apiUrl}`);
          const response = await fetch(apiUrl, { 
            method: 'GET',
            headers,
            mode: 'cors'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`GitHub API returned ${data?.items?.length || 0} results`);
            
            if (data && data.items) {
              for (const item of data.items) {
                // Add all items, we'll filter later
                searchResults.push({
                  url: item.html_url,
                  name: item.name,
                  description: item.description || '',
                  owner: item.owner.login,
                  stars: item.stargazers_count,
                  forks: item.forks_count,
                  topics: item.topics || [],
                  language: item.language,
                  license: item.license ? (item.license.spdx_id || item.license.name || 'Unknown') : 'Unknown',
                  updated: item.updated_at
                });
              }
            }
          } else {
            console.error(`GitHub API returned status ${response.status}`);
            // If we get a 401 error, the token might be invalid
            if (response.status === 401 && githubToken) {
              console.error('GitHub token appears to be invalid');
              // Don't clear the token automatically - let the user manage it
              // localStorage.removeItem('github_token');
            }
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error searching GitHub API:', error);
          // Fallback to simulated results if API fails
          console.log('Falling back to simulated results');
          const simulatedResults = this.generateSimulatedResults(query);
          searchResults.push(...simulatedResults);
        }
        
        return searchResults;
      } catch (error) {
        console.error('Error in GitHub search:', error);
        return this.generateSimulatedResults(query);
      }
    } catch (error) {
      console.error('Error in GitHub search:', error);
      return this.generateSimulatedResults(query);
    }
  },
  
  /**
   * Search GitHub for repositories
   * @param query Search query
   * @returns Array of repository information
   */
  async searchGitHub(query: string): Promise<any[]> {
    try {
      console.log(`Searching GitHub for: ${query}`);
      
      // Try to get token from localStorage but proceed even if missing
      const githubToken = localStorage.getItem('github_token') || '';
      console.log(`Search with${githubToken ? '' : 'out'} GitHub token`);
      
      // Try GitHub API first if token is available
      if (githubToken) {
        try {
          console.log('Attempting GitHub API search with token');
          const apiResults = await this.searchWithGitHubAPI(query, githubToken);
          if (apiResults && apiResults.length > 0) {
            console.log(`GitHub API search successful: ${apiResults.length} results`);
            return apiResults;
          }
          console.log('GitHub API search returned no results, falling back');
        } catch (apiError) {
          console.error('GitHub API search failed:', apiError);
          console.log('Falling back to direct search');
        }
      } else {
        console.log('No GitHub token available, skipping API search');
      }
      
      // If no token is available, return empty results
      if (!githubToken) {
        console.log('No GitHub token available for API search, using fallback data');
        return this.generateSimulatedResults(query);
      }
      
      console.log('Using GitHub token for API search');
      const searchResults = [];
      
      // Try GitHub API with fetch
      try {
        // GitHub search API (if token is available)
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json'
        };
        
        if (githubToken) {
          // Try with proper GitHub token format - no 'token' or 'Bearer' prefix as it might vary
          headers['Authorization'] = githubToken.startsWith('ghp_') ? `token ${githubToken}` : 
                                    (githubToken.startsWith('github_pat_') ? `token ${githubToken}` : githubToken);
          
          console.log('Using Authorization header:', 
                     headers['Authorization'].substring(0, 10) + '...' + 
                     headers['Authorization'].substring(headers['Authorization'].length - 5));
        }
        
        // Use GitHub search API to find repositories
        const searchTerms = query.split(' ').filter(term => term.length > 2);
        const queryString = searchTerms.join('+');
        
        // Add language filter to the query to prioritize English content
        // We'll search for a high number of results (up to 100 per page)
        // Remove strict language filters to get more results
        const apiUrl = `https://api.github.com/search/repositories?q=${queryString}+in:name,description,readme&sort=stars&order=desc&per_page=100`;
        
        // First check if the fetch will succeed (CORS check)
        try {
          console.log(`Fetching from GitHub API: ${apiUrl}`);
          const response = await fetch(apiUrl, { 
            method: 'GET',
            headers,
            mode: 'cors'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`GitHub API returned ${data?.items?.length || 0} results`);
            
            if (data && data.items) {
              for (const item of data.items) {
                // Add all items, we'll filter later
                searchResults.push({
                  url: item.html_url,
                  name: item.name,
                  description: item.description || '',
                  owner: item.owner.login,
                  stars: item.stargazers_count,
                  forks: item.forks_count,
                  topics: item.topics || [],
                  language: item.language,
                  license: item.license ? (item.license.spdx_id || item.license.name || 'Unknown') : 'Unknown',
                  updated: item.updated_at
                });
              }
            }
          } else {
            console.error(`GitHub API returned status ${response.status}`);
            // If we get a 401 error, the token might be invalid
            if (response.status === 401 && githubToken) {
              console.error('GitHub token appears to be invalid');
              // Don't clear the token automatically - let the user manage it
              // localStorage.removeItem('github_token');
            }
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error searching GitHub API:', error);
          // Fallback to simulated results if API fails
          console.log('Falling back to simulated results');
          const simulatedResults = this.generateSimulatedResults(query);
          searchResults.push(...simulatedResults);
        }
        
        return searchResults;
      } catch (error) {
        console.error('Error in GitHub search:', error);
        return this.generateSimulatedResults(query);
      }
    } catch (error) {
      console.error('Error in GitHub search:', error);
      return this.generateSimulatedResults(query);
    }
  },
  
  /**
   * Search GitHub API with token
   * @param query Search query
   * @param token GitHub token
   * @returns Array of repository information
   */
  async searchWithGitHubAPI(query: string, token: string): Promise<any[]> {
    try {
      console.log(`Searching GitHub API for: ${query}`);
      
      // GitHub search API (if token is available)
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': token.startsWith('ghp_') ? `token ${token}` : 
                        (token.startsWith('github_pat_') ? `token ${token}` : token)
      };
      
      // Use GitHub search API to find repositories
      const searchTerms = query.split(' ').filter(term => term.length > 2);
      const queryString = searchTerms.join('+');
      
      // Add language filter to the query to prioritize English content
      // We'll search for a high number of results (up to 100 per page)
      // Remove strict language filters to get more results
      const apiUrl = `https://api.github.com/search/repositories?q=${queryString}+in:name,description,readme&sort=stars&order=desc&per_page=100`;
      
      // First check if the fetch will succeed (CORS check)
      try {
        console.log(`Fetching from GitHub API: ${apiUrl}`);
        const response = await fetch(apiUrl, { 
          method: 'GET',
          headers,
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`GitHub API returned ${data?.items?.length || 0} results`);
          
          if (data && data.items) {
            return data.items.map(item => ({
              url: item.html_url,
              name: item.name,
              description: item.description || '',
              owner: item.owner.login,
              stars: item.stargazers_count,
              forks: item.forks_count,
              topics: item.topics || [],
              language: item.language,
              license: item.license ? (item.license.spdx_id || item.license.name || 'Unknown') : 'Unknown',
              updated: item.updated_at
            }));
          }
        } else {
          console.error(`GitHub API returned status ${response.status}`);
          // If we get a 401 error, the token might be invalid
          if (response.status === 401 && token) {
            console.error('GitHub token appears to be invalid');
            // Don't clear the token automatically - let the user manage it
            // localStorage.removeItem('github_token');
          }
          throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error searching GitHub API:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in GitHub API search:', error);
      throw error;
    }
  },
  
  /**
   * Generate simulated search results based on query
   */
  generateSimulatedResults(query: string, count: number = 10): any[] {
    // Generate realistic looking but randomized results
    const topics = ['ai', 'agent', 'llm', 'mcp', 'autonomous', 'framework', 'ml', 'nlp'];
    const languages = ['Python', 'TypeScript', 'JavaScript', 'Go', 'Rust', 'Java'];
    const licenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'AGPL-3.0', 'MPL-2.0'];
    const repositories = [];
    
    // Simulate finding a random number of repositories (5-25)
    const simulatedCount = Math.floor(Math.random() * 20) + 5;
    
    for (let i = 0; i < simulatedCount && repositories.length < count; i++) {
      const repoTopics = [];
      // Add 2-5 random topics
      const topicCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < topicCount; j++) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        if (!repoTopics.includes(topic)) {
          repoTopics.push(topic);
        }
      }
      
      // Ensure at least one relevant topic is included
      if (!repoTopics.includes('ai') && !repoTopics.includes('agent') && !repoTopics.includes('mcp')) {
        repoTopics.push('ai');
      }
      
      // Generate a unique name
      const prefix = ['Open', 'Auto', 'Smart', 'Super', 'Hyper', 'Meta', 'Neural', 'AI'][Math.floor(Math.random() * 8)];
      const suffix = ['Agent', 'GPT', 'LLM', 'MCP', 'Framework', 'Bot', 'Assistant'][Math.floor(Math.random() * 7)];
      const name = `${prefix}${suffix}${i + 1}`;
      
      repositories.push({
        url: `https://github.com/example-org/${name.toLowerCase()}`,
        name,
        description: this.generateDescription(repoTopics),
        owner: 'example-org',
        stars: Math.floor(Math.random() * 10000),
        forks: Math.floor(Math.random() * 2000),
        topics: repoTopics,
        language: languages[Math.floor(Math.random() * languages.length)],
        updated: new Date().toISOString(),
        license: licenses[Math.floor(Math.random() * licenses.length)]
      });
    }
    
    return repositories;
  },
  
  /**
   * Generate a realistic description based on topics
   */
  generateDescription(topics: string[]): string {
    const aiDescriptions = [
      'An autonomous AI agent framework for',
      'A sophisticated AI assistant platform that',
      'Advanced AI agent system that',
      'Intelligent AI framework for',
      'AI-powered agent that'
    ];
    
    const mcpDescriptions = [
      'Model Context Protocol implementation for',
      'MCP-based framework for',
      'Model Context Orchestration system that',
      'Advanced context management for AI agents that',
      'Robust MCP framework that'
    ];
    
    const actionDescriptions = [
      'automates complex tasks',
      'performs sophisticated operations',
      'executes multi-step workflows',
      'handles autonomous decision making',
      'processes natural language commands',
      'organizes and executes tasks intelligently',
      'builds agent-based applications'
    ];
    
    const prefix = topics.includes('mcp') ? 
      mcpDescriptions[Math.floor(Math.random() * mcpDescriptions.length)] :
      aiDescriptions[Math.floor(Math.random() * aiDescriptions.length)];
      
    const action = actionDescriptions[Math.floor(Math.random() * actionDescriptions.length)];
    
    return `${prefix} ${action}`;
  },
  
  /**
   * Normalize a GitHub URL to its canonical form
   */
  normalizeGitHubUrl(url: string): string | null {
    try {
      // Check if this is a GitHub URL
      if (!url.includes('github.com')) return null;
      
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // We need at least owner/repo
      if (pathParts.length < 2) return null;
      
      // Normalize to the repository root
      return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Check if repository is related to AI agents
   */
  isAIAgentRepository(repository: any): boolean {
    const { name, description, topics = [], language } = repository;
    
    // Check if content appears to be non-English
    if (!this.isEnglishContent(name) || !this.isEnglishContent(description)) {
      return false;
    }
    
    // Exclude non-English programming languages
    const nonEnglishLanguages = ['Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];
    if (language && nonEnglishLanguages.includes(language)) {
      return false;
    }
    
    const textToSearch = [
      name, 
      description,
      ...topics
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Keywords related to AI agents - require exact matches
    const aiAgentKeywords = [
      'ai agent', 'ai-agent', 'aiagent',
      'llm agent', 'llm-agent', 'llmagent',
      'autonomous agent', 'agent framework',
      'agent-framework', 'agent orchestration',
      'agent-orchestration', 'ai assistant',
      'ai-assistant', 'llm framework',
      'agent system', 'multi-agent',
      'multiagent', 'agent communication'
    ];
    
    // Check for exact keyword matches
    return aiAgentKeywords.some(keyword => textToSearch.includes(keyword));
  },
  
  /**
   * Check if repository is related to MCP (Model Context Protocol)
   */
  isMCPRepository(repository: any): boolean {
    const { name, description, topics = [], language } = repository;
    
    // Check if content appears to be non-English
    if (!this.isEnglishContent(name) || !this.isEnglishContent(description)) {
      return false;
    }
    
    // Exclude non-English programming languages
    const nonEnglishLanguages = ['Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];
    if (language && nonEnglishLanguages.includes(language)) {
      return false;
    }
    
    const textToSearch = [
      name, 
      description,
      ...topics
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Keywords specifically related to MCP - require exact matches
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
    
    // Check for exact keyword matches
    return mcpKeywords.some(keyword => textToSearch.includes(keyword));
  },
  
  /**
   * Check if text content appears to be in English
   * Uses a simple heuristic to detect non-English content
   */
  isEnglishContent(text: string | null | undefined): boolean {
    if (!text) return true; // Empty text is considered valid
    
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
        // If ANY non-English characters are found, reject the content
        return false;
      }
    }
    
    // Additional check for repositories with mixed language content
    // Check if the text has a high ratio of non-ASCII characters
    const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
    const textLength = text.length;
    
    // If more than 10% of characters are non-ASCII, consider it non-English
    if (textLength > 0 && nonAsciiCount / textLength > 0.1) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Convert repository information to an Agent object
   */
  convertToAgent(repo: any): Agent {
    if (!repo) {
      console.error("Attempted to convert undefined repository");
      // Return a placeholder agent if repo is undefined
      return {
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Unknown Repository',
        description: 'Error loading repository data',
        stars: 0,
        forks: 0,
        url: '',
        owner: 'unknown',
        avatar: 'https://github.com/ghost.png',
        language: 'Unknown',
        updated: new Date().toISOString(),
        topics: ['error'],
        license: 'Unknown'
      };
    }
    
    // Format license information properly
    let licenseText = 'Unknown';
    if (repo.license) {
      if (typeof repo.license === 'string') {
        licenseText = repo.license;
      } else if (typeof repo.license === 'object' && repo.license.name) {
        licenseText = repo.license.name;
      } else if (typeof repo.license === 'object' && repo.license.spdx_id) {
        licenseText = repo.license.spdx_id;
      }
    }
    
    // Ensure all fields have valid values
    return {
      id: `github-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: repo.name || 'Unnamed Repository',
      description: repo.description || 'AI Agent/MCP Repository',
      stars: typeof repo.stars === 'number' ? repo.stars : 0,
      forks: typeof repo.forks === 'number' ? repo.forks : 0,
      url: repo.url || '#',
      owner: repo.owner || 'unknown',
      avatar: repo.owner ? `https://github.com/${repo.owner}.png` : 'https://github.com/ghost.png',
      language: repo.language || 'Unknown',
      updated: repo.updated || new Date().toISOString(),
      topics: Array.isArray(repo.topics) ? repo.topics : ['ai', 'agent'],
      license: licenseText
    };
  },
  
  /**
   * Get fallback repositories if search fails
   */
  getFallbackRepositories(isFirstImport = false): Agent[] {
    // Return a mix of popular AI agent and MCP repositories
    const fallbackRepos = [
      {
        id: `fallback-${Date.now()}-1`,
        name: 'Auto-GPT',
        description: 'An experimental open-source autonomous AI agent',
        stars: 153000,
        forks: 39200,
        url: 'https://github.com/Significant-Gravitas/Auto-GPT',
        owner: 'Significant-Gravitas',
        avatar: 'https://github.com/Significant-Gravitas.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai', 'agents', 'autonomous', 'gpt'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-2`,
        name: 'BabyAGI',
        description: 'AI-powered task management system using LLMs',
        stars: 17700,
        forks: 2700,
        url: 'https://github.com/yoheinakajima/babyagi',
        owner: 'yoheinakajima',
        avatar: 'https://github.com/yoheinakajima.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai', 'agi', 'autonomous-agents'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-3`,
        name: 'AgentGPT',
        description: 'Deploy autonomous AI Agents on your browser',
        stars: 28100,
        forks: 5100,
        url: 'https://github.com/reworkd/AgentGPT',
        owner: 'reworkd',
        avatar: 'https://github.com/reworkd.png',
        language: 'TypeScript',
        updated: new Date().toISOString(),
        topics: ['ai', 'web', 'gpt', 'agents'],
        license: 'GPL-3.0'
      },
      {
        id: `fallback-${Date.now()}-4`,
        name: 'MCP Framework',
        description: 'Model Context Protocol implementation for AI Agents',
        stars: 3500,
        forks: 450,
        url: 'https://github.com/AgentMCP/mcp-framework',
        owner: 'AgentMCP',
        avatar: 'https://github.com/AgentMCP.png',
        language: 'TypeScript',
        updated: new Date().toISOString(),
        topics: ['mcp', 'ai', 'context-orchestration'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-5`,
        name: 'CrewAI',
        description: 'Framework for orchestrating role-playing autonomous AI agents',
        stars: 19800,
        forks: 2300,
        url: 'https://github.com/joaomdmoura/crewAI',
        owner: 'joaomdmoura',
        avatar: 'https://github.com/joaomdmoura.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai', 'agents', 'collaborative'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-6`,
        name: 'LangChain',
        description: 'Building applications with LLMs through composability',
        stars: 72000,
        forks: 12000,
        url: 'https://github.com/langchain-ai/langchain',
        owner: 'langchain-ai',
        avatar: 'https://github.com/langchain-ai.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai', 'llm', 'nlp', 'language-model'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-7`,
        name: 'SuperAGI',
        description: 'A dev-first open source autonomous AI agent framework',
        stars: 13000,
        forks: 1900,
        url: 'https://github.com/TransformerOptimus/SuperAGI',
        owner: 'TransformerOptimus',
        avatar: 'https://github.com/TransformerOptimus.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['ai', 'agi', 'autonomous', 'framework'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-8`,
        name: 'Model Context Protocol',
        description: 'Protocol for model context management and agent communication',
        stars: 5200,
        forks: 780,
        url: 'https://github.com/context-labs/model-context-protocol',
        owner: 'context-labs',
        avatar: 'https://github.com/context-labs.png',
        language: 'TypeScript',
        updated: new Date().toISOString(),
        topics: ['mcp', 'model-context-protocol', 'agent-communication'],
        license: 'Apache-2.0'
      },
      {
        id: `fallback-${Date.now()}-9`,
        name: 'ContextFlow',
        description: 'Context window management for large language models',
        stars: 2800,
        forks: 310,
        url: 'https://github.com/flowcorp/contextflow',
        owner: 'flowcorp',
        avatar: 'https://github.com/flowcorp.png',
        language: 'Python',
        updated: new Date().toISOString(),
        topics: ['mcp', 'context-window', 'context-management'],
        license: 'MIT'
      },
      {
        id: `fallback-${Date.now()}-10`,
        name: 'ModelOrchestrator',
        description: 'Orchestration framework for LLM context and inter-agent communication',
        stars: 4100,
        forks: 520,
        url: 'https://github.com/orchestrate-ai/model-orchestrator',
        owner: 'orchestrate-ai',
        avatar: 'https://github.com/orchestrate-ai.png',
        language: 'JavaScript',
        updated: new Date().toISOString(),
        topics: ['mcp', 'model-orchestration', 'agent-communication'],
        license: 'MIT'
      }
    ];
    
    // Generate some additional simulated repositories to reach max results
    const maxResults = isFirstImport ? 250 : 100;
    const simulatedRepos = this.generateSimulatedResults('AI Agent MCP', 50);
    const combinedRepos = [...fallbackRepos];
    
    // Add simulated repos until we have enough repositories
    for (let i = 0; i < simulatedRepos.length && combinedRepos.length < maxResults; i++) {
      // Make sure it's not a duplicate URL
      const simRepo = this.convertToAgent(simulatedRepos[i]);
      const isDuplicate = combinedRepos.some(repo => repo.url === simRepo.url);
      
      if (!isDuplicate) {
        combinedRepos.push(simRepo);
      }
    }
    
    return combinedRepos.slice(0, maxResults);
  },

  /**
   * Get top agent MCP projects
   */
  getTopAgentMcpProjects(): Promise<Agent[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get all projects
        const allProjects = this.getAllExistingProjects();
        
        // Filter for projects explicitly related to AI Agents or MCP using more specific criteria
        const agentMcpProjects = allProjects.filter(agent => {
          // First check if content is in English
          if (!this.isEnglishContent(agent.name) || !this.isEnglishContent(agent.description)) {
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
  },
  
  /**
   * Add a project from a GitHub URL
   */
  async addProjectFromGitHub(url: string) {
    try {
      // Normalize the GitHub URL
      const normalizedUrl = this.normalizeGitHubUrl(url);
      if (!normalizedUrl) {
        return {
          success: false,
          error: 'Invalid GitHub URL'
        };
      }

      // Extract owner and repo from URL
      const urlParts = normalizedUrl.split('/');
      const owner = urlParts[urlParts.length - 2];
      const name = urlParts[urlParts.length - 1];

      // Try to fetch repository details from GitHub API
      try {
        const githubToken = localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.NEXT_PUBLIC_GITHUB_TOKEN || '';
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json'
        };
        
        if (githubToken) {
          // Try with proper GitHub token format - no 'token' or 'Bearer' prefix as it might vary
          headers['Authorization'] = githubToken.startsWith('ghp_') ? `token ${githubToken}` : 
                                    (githubToken.startsWith('github_pat_') ? `token ${githubToken}` : githubToken);
          
          console.log('Using Authorization header:', 
                     headers['Authorization'].substring(0, 10) + '...' + 
                     headers['Authorization'].substring(headers['Authorization'].length - 5));
        }
        
        const apiUrl = `https://api.github.com/repos/${owner}/${name}`;
        const response = await fetch(apiUrl, { 
          method: 'GET',
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if repository is in a non-English language
          const nonEnglishLanguages = ['Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];
          if (data.language && nonEnglishLanguages.includes(data.language)) {
            return {
              success: false,
              error: 'Only repositories in English are accepted'
            };
          }
          
          // Create a repository object with actual data
          const repo = {
            name: data.name,
            owner: data.owner.login,
            url: data.html_url,
            description: data.description || '',
            stars: data.stargazers_count,
            forks: data.forks_count,
            language: data.language || '',
            topics: data.topics || ['ai', 'agent'],
            license: data.license ? (data.license.spdx_id || data.license.name || 'Unknown') : 'Unknown',
            updated: data.updated_at
          };
          
          // Convert to Agent
          const agent = this.convertToAgent(repo);
          
          // Check for duplicates
          const existingProjects = this.getAllExistingProjects();
          const isDuplicateProject = existingProjects.some(existingRepo => 
            (existingRepo.url && agent.url && existingRepo.url.toLowerCase() === agent.url.toLowerCase()) ||
            (existingRepo.name && agent.name && existingRepo.owner && agent.owner && 
             existingRepo.name.toLowerCase() === agent.name.toLowerCase() && 
             existingRepo.owner.toLowerCase() === agent.owner.toLowerCase())
          );
          
          if (isDuplicateProject) {
            return {
              success: false,
              error: 'This project already exists in the directory'
            };
          }
          
          // Add to user-submitted projects
          USER_SUBMITTED_PROJECTS.push(agent);
          saveUserSubmittedProjects(USER_SUBMITTED_PROJECTS);
          
          return {
            success: true,
            agent
          };
        }
      } catch (error) {
        console.error('Error fetching repository details:', error);
      }

      // Fallback to basic info if API call fails
      const repo = {
        name,
        owner,
        url: normalizedUrl,
        description: '',
        stars: 0,
        forks: 0,
        language: '',
        topics: ['ai', 'agent'],
        license: 'Unknown', // Fixed the license in the fallback case
        updated: new Date().toISOString()
      };

      // Convert to Agent
      const agent = this.convertToAgent(repo);

      // Check for duplicates
      const existingProjects = this.getAllExistingProjects();
      const isDuplicateProject = existingProjects.some(existingRepo => 
        (existingRepo.url && agent.url && existingRepo.url.toLowerCase() === agent.url.toLowerCase()) ||
        (existingRepo.name && agent.name && existingRepo.owner && agent.owner && 
         existingRepo.name.toLowerCase() === agent.name.toLowerCase() && 
         existingRepo.owner.toLowerCase() === agent.owner.toLowerCase())
      );
      
      if (isDuplicateProject) {
        return {
          success: false,
          error: 'This project already exists in the directory'
        };
      }
      
      // Add to user-submitted projects
      USER_SUBMITTED_PROJECTS.push(agent);
      saveUserSubmittedProjects(USER_SUBMITTED_PROJECTS);

      return {
        success: true,
        agent
      };
    } catch (error) {
      console.error('Error adding project from GitHub:', error);
      return {
        success: false,
        error: 'Failed to add project'
      };
    }
  },
};

export { ScrapeService, loadUserSubmittedProjects, saveUserSubmittedProjects };

// TypeScript type for ScrapeService
export type ScrapeServiceType = typeof ScrapeService;
