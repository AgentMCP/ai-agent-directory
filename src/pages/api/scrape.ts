import axios from 'axios';
import { load } from 'cheerio';

// Define Next.js API types
type NextApiRequest = {
  query: {
    [key: string]: string | string[] | undefined;
  };
  method: string;
  body: any;
  headers: {
    [key: string]: string | string[] | undefined;
  };
};

type NextApiResponse<T = any> = {
  status: (code: number) => NextApiResponse<T>;
  json: (data: T) => void;
  send: (data: T) => void;
  end: () => void;
};

// Type definitions to address missing dependencies
declare const process: {
  env: {
    NEXT_PUBLIC_GITHUB_TOKEN?: string;
    [key: string]: string | undefined;
  };
};

declare const Buffer: {
  from(data: string, encoding: string): {
    toString(): string;
  };
};

// GitHub token from environment variables
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';

// Response data interface
interface ScrapeResponse {
  results?: Array<{
    title: string;
    link: string;
    description?: string;
    owner?: string;
    stars?: number;
    forks?: number;
    language?: string;
    updatedAt?: string;
    topics?: string[];
  }>;
  error?: string;
  message?: string;
}

// Function to extract GitHub repos from Google search results
async function searchGoogleForRepos(query: string, numPages = 10): Promise<string[]> {
  let allRepoUrls: string[] = [];
  
  try {
    for (let page = 0; page < numPages && allRepoUrls.length < 100; page++) {
      const startParam = page * 10; // Google uses multiples of 10 for pagination
      const { data } = await axios.get(
        `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${startParam}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        }
      );

      const $ = load(data);
      
      // Extract links from Google search results
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        
        // Filter GitHub repository links
        if (href.includes('/url?q=https://github.com/') && !href.includes('/issues/') && !href.includes('/pull/')) {
          let repoUrl = href.split('/url?q=')[1]?.split('&')[0] || '';
          
          if (repoUrl.startsWith('https://github.com/') && repoUrl.split('/').filter(Boolean).length >= 3) {
            // Normalize URL to repository root (remove fragments, queries, etc.)
            const urlParts = new URL(repoUrl);
            const pathParts = urlParts.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 2) {
              const normalizedUrl = `https://github.com/${pathParts[0]}/${pathParts[1]}`;
              if (!allRepoUrls.includes(normalizedUrl)) {
                allRepoUrls.push(normalizedUrl);
              }
            }
          }
        }
      });
      
      // Wait to avoid being rate-limited
      if (page < numPages - 1 && allRepoUrls.length < 100) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    return allRepoUrls.slice(0, 100); // Ensure we don't exceed 100 results
  } catch (error) {
    console.error('Error searching Google:', error);
    return [];
  }
}

// Function to validate if a repo is related to AI agents or MCP
async function validateGitHubRepo(repoUrl: string): Promise<{
  isValid: boolean;
  repoData?: any;
}> {
  try {
    // Parse owner and repo from URL
    const urlObj = new URL(repoUrl);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      return { isValid: false };
    }
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    
    // Set up GitHub API request with authentication if token available
    const headers: Record<string, string> = { 
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    // Fetch repository data from GitHub API
    const repoResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    
    // Search for AI Agent or MCP related terms in description, readme, and topics
    const repoData = repoResponse.data;
    
    // Validate based on description and topics
    const description = (repoData.description || '').toLowerCase();
    const topics = repoData.topics || [];
    
    // Keywords to match
    const keywords = [
      'ai agent', 'ai-agent', 'aiagent',
      'mcp', 'model context', 'context orchestrat',
      'autonomous agent', 'llm agent', 'agent framework',
      'agent orchestrat', 'multi agent', 'multi-agent'
    ];
    
    // Check if any keyword matches in description or topics
    const matchesKeyword = keywords.some(keyword => 
      description.includes(keyword) || 
      topics.some(topic => topic.toLowerCase().includes(keyword.replace(/\s+/g, '')))
    );
    
    if (matchesKeyword) {
      return { isValid: true, repoData };
    }
    
    // If no match in description or topics, try to check the README
    if (!matchesKeyword && GITHUB_TOKEN) {
      try {
        // Get default branch
        const defaultBranch = repoData.default_branch || 'main';
        
        // Try to fetch README
        const readmeResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${defaultBranch}`,
          { headers }
        );
        
        if (readmeResponse.data && readmeResponse.data.content) {
          // Decode base64 content
          const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString();
          const readmeText = readmeContent.toLowerCase();
          
          // Check if README contains relevant keywords
          const readmeMatchesKeyword = keywords.some(keyword => readmeText.includes(keyword));
          
          if (readmeMatchesKeyword) {
            return { isValid: true, repoData };
          }
        }
      } catch (error) {
        // README might not exist or other issues, continue with validation results
      }
    }
    
    return { isValid: false };
  } catch (error) {
    console.error('Error validating GitHub repo:', error);
    return { isValid: false };
  }
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ScrapeResponse>
) {
  const { query = 'AI Agent GitHub MCP' } = req.query;
  const searchQuery = Array.isArray(query) ? query[0] : query;

  try {
    // Search terms to use
    const searchTerms = [
      'AI Agent GitHub', 
      'MCP GitHub', 
      'Model Context Orchestration GitHub',
      'Autonomous AI Agent GitHub', 
      'LLM Agent Framework GitHub'
    ];
    
    // Collect all GitHub repository URLs from Google search
    let allRepoUrls: string[] = [];
    
    for (const term of searchTerms) {
      if (allRepoUrls.length >= 100) break;
      
      const termQuery = `${term} ${searchQuery}`;
      const repoUrls = await searchGoogleForRepos(termQuery, 3); // Search 3 pages per term
      
      // Add new URLs to the collection
      for (const url of repoUrls) {
        if (!allRepoUrls.includes(url) && allRepoUrls.length < 100) {
          allRepoUrls.push(url);
        }
      }
    }
    
    // Validate and process each repository
    const validRepos = [];
    
    for (const repoUrl of allRepoUrls) {
      // Skip after reaching 100 valid repos
      if (validRepos.length >= 100) break;
      
      const validation = await validateGitHubRepo(repoUrl);
      
      if (validation.isValid && validation.repoData) {
        const repo = validation.repoData;
        
        validRepos.push({
          title: repo.name,
          link: repoUrl,
          description: repo.description,
          owner: repo.owner.login,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updatedAt: repo.updated_at,
          topics: repo.topics || []
        });
      }
    }
    
    res.status(200).json({ results: validRepos });
  } catch (error: any) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Scraping failed', 
      message: error.message || 'Unknown error' 
    });
  }
}
