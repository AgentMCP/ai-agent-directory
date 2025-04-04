import { useState, useEffect, useRef, useMemo } from 'react';
import AgentCard from './AgentCard';
import { Agent, FilterOptions, SortOption } from '../types';
import Filters from './Filters';
import { SupabaseService, supabase, PROJECTS_TABLE } from '../services/SupabaseService';
import { GitHubService, REAL_PROJECTS } from '../services/GitHubService';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  SlidersHorizontal,
  X,
  Plus,
  Github,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import BulkImportModal from './BulkImportModal';
import { toast } from './ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import AddRepositoryDialog from './AddRepositoryDialog';

interface DirectoryGridProps {
  initialSearchQuery?: string;
}

const DirectoryGrid: React.FC<DirectoryGridProps> = ({ initialSearchQuery = '' }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const pageSizeOptions = [25, 50, 100];
  
  // Filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: initialSearchQuery,
    language: '',
    license: '',
    sort: 'stars',
  });
  
  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // GitHub token state
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [githubToken, setGithubToken] = useState<string>('');
  
  // Total project count state
  const [totalProjectCount, setTotalProjectCount] = useState<number | null>(null);
  
  // Load the GitHub token from localStorage if present
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token') || '';
    console.log(`DirectoryGrid: Found saved token: ${savedToken ? '✓' : '✗'}`);
    setGithubToken(savedToken);
  }, []);
  
  const handleSaveToken = () => {
    if (githubToken.trim()) {
      localStorage.setItem('github_token', githubToken.trim());
      console.log('DirectoryGrid: GitHub token saved to localStorage');
      setShowTokenInput(false);
      toast({
        title: "GitHub Token Saved",
        description: "Your GitHub token has been saved successfully.",
      });
    }
  };

  const fetchAgents = async () => {
    console.log('DirectoryGrid: Starting to fetch agents');
    setIsLoading(true);
    setError(null);
    
    try {
      // Force a fresh fetch from Supabase ONLY - no local storage
      console.log('DirectoryGrid: Forcing fresh fetch from Supabase');
      
      // Clear any local storage to prevent using cached data
      localStorage.removeItem('directory_projects');
      
      // Get data directly from Supabase
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*');
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      // IMPORTANT: Always use the data from Supabase, even if empty
      // This ensures we don't use dummy data when the database is empty
      console.log(`DirectoryGrid: Loaded ${data?.length || 0} agents directly from Supabase`);
      
      // Remove duplicates by URL
      const uniqueProjects: Agent[] = [];
      const seenUrls = new Set<string>();
      const seenOwnerRepos = new Set<string>();
      
      if (data && data.length > 0) {
        data.forEach(project => {
          if (project.url) {
            const normalizedUrl = project.url.toLowerCase().trim();
            
            // For GitHub URLs, extract and standardize the path portion
            let standardizedUrl = normalizedUrl;
            try {
              if (normalizedUrl.includes('github.com')) {
                const url = new URL(normalizedUrl);
                // Get path without leading slash and remove any trailing slashes
                let pathParts = url.pathname.split('/').filter(part => part);
                // Keep only owner/repo part (first two segments)
                if (pathParts.length >= 2) {
                  standardizedUrl = `github.com/${pathParts[0].toLowerCase()}/${pathParts[1].toLowerCase()}`;
                }
              }
            } catch (e) {
              // URL parsing failed, use normalized URL as is
              console.warn('URL parsing failed:', normalizedUrl);
            }
            
            // Create a unique key for owner/name combination if available
            const ownerRepoKey = project.owner && project.name ? 
              `${project.owner.toLowerCase()}-${project.name.toLowerCase()}` : null;
            
            // Check if we've seen this URL or owner/repo combination before
            if (!seenUrls.has(standardizedUrl) && 
                (!ownerRepoKey || !seenOwnerRepos.has(ownerRepoKey))) {
              
              // Add to our tracking sets
              seenUrls.add(standardizedUrl);
              if (ownerRepoKey) {
                seenOwnerRepos.add(ownerRepoKey);
              }
              
              // Add to unique projects
              uniqueProjects.push(project);
            }
          } else {
            uniqueProjects.push(project);
          }
        });
        
        if (uniqueProjects.length < data.length) {
          console.log(`DirectoryGrid: Removed ${data.length - uniqueProjects.length} duplicate projects`);
        }
      }
      
      // Set the cleaned data as our agents
      console.log(`DirectoryGrid: ${uniqueProjects.length} unique agents loaded`);
      setAgents(uniqueProjects);
      
      // Also update the total project count
      await getProjectCount();
      
    } catch (error: any) {
      console.error('DirectoryGrid: Error fetching agents:', error);
      setError(error.message || 'Failed to load projects');
      
      toast({
        title: 'Error Loading Projects',
        description: 'There was a problem loading the projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Initial data fetch
    console.log('DirectoryGrid: Initial component mount, fetching data');
    fetchAgents();
    
    // Set up storage and custom event listeners to detect changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase_updated') {
        console.log('DirectoryGrid: Storage change detected, refreshing data');
        fetchAgents();
      }
    };
    
    // Event listener for custom event (for same-browser updates)
    const handleCustomEvent = () => {
      console.log('DirectoryGrid: Custom event detected, refreshing data');
      fetchAgents();
    };
    
    // Listen for storage events (for cross-browser updates)
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom events (for same-browser updates)
    window.addEventListener('supabase_updated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('supabase_updated', handleCustomEvent);
    };
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    console.log('DirectoryGrid: Filter options changed, applying filters');
    applyFilters();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filterOptions, agents]);
  
  const applyFilters = () => {
    console.log('DirectoryGrid: Applying filters:', filterOptions);
    let filtered = [...agents];
    
    if (filterOptions.searchQuery) {
      // Apply search filtering
      const normalizedQuery = filterOptions.searchQuery.toLowerCase().trim();
      const searchTerms = normalizedQuery.split(/\s+/);
      
      filtered = filtered.filter(agent => {
        // Ensure agent and its properties exist
        if (!agent || agent.isLoading) return false;
        
        const name = agent.name?.toLowerCase() || '';
        const desc = agent.description?.toLowerCase() || '';
        const lang = agent.language?.toLowerCase() || '';
        const license = agent.license?.toLowerCase() || '';
        
        // Check if any search term matches any of the agent properties
        return searchTerms.some(term => 
          name.includes(term) || 
          desc.includes(term) || 
          lang.includes(term) ||
          license.includes(term)
        );
      });
    }
    
    if (filterOptions.language) {
      const normalizedLanguage = filterOptions.language.toLowerCase();
      
      filtered = filtered.filter(agent => {
        const language = agent.language?.toLowerCase() || '';
        return language === normalizedLanguage;
      });
    }
    
    if (filterOptions.license) {
      const normalizedLicense = filterOptions.license.toLowerCase();
      
      filtered = filtered.filter(agent => {
        const license = agent.license?.toLowerCase() || '';
        return license === normalizedLicense;
      });
    }
    
    // Sort the filtered agents
    const sorted = sortAgents(filtered, filterOptions.sort);
    
    console.log(`DirectoryGrid: Filtered agents count: ${sorted.length}`);
    setFilteredAgents(sorted);
  };
  
  // Generic sort function for agents
  const sortAgents = (agents: Agent[], sortOption: SortOption): Agent[] => {
    return [...agents].sort((a, b) => {
      switch (sortOption) {
        case 'stars':
          return (b.stars || 0) - (a.stars || 0);
        case 'forks':
          return (b.forks || 0) - (a.forks || 0);
        case 'updated':
          return new Date(b.updated || 0).getTime() - new Date(a.updated || 0).getTime();
        default:
          return (b.stars || 0) - (a.stars || 0);
      }
    });
  };
  
  // Get unique languages from all agents for filtering
  const languages = useMemo(() => {
    const languageSet = new Set<string>();
    
    agents.forEach(agent => {
      if (agent.language) {
        languageSet.add(agent.language);
      }
    });
    
    return Array.from(languageSet).sort();
  }, [agents]);
  
  // Get unique licenses from all agents for filtering
  const licenses = useMemo(() => {
    const licenseSet = new Set<string>();
    
    agents.forEach(agent => {
      if (agent.license) {
        licenseSet.add(agent.license);
      }
    });
    
    return Array.from(licenseSet).sort();
  }, [agents]);
  
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      console.log("Refreshing directory with latest data...");
      
      // Get the latest projects from Supabase/localStorage via the service
      const supabaseService = SupabaseService.getInstance();
      const latestProjects = await supabaseService.getAllProjects();
      
      console.log(`Refresh complete: Loaded ${latestProjects.length} projects`);
      
      // Update both the full set and filtered set of agents
      setAgents(latestProjects);
      setFilteredAgents(latestProjects);
      
      // Show success toast
      toast({
        title: "Refresh Complete",
        description: `Loaded ${latestProjects.length} projects from database`,
      });
    } catch (error) {
      console.error("Error refreshing directory:", error);
      
      // Show error toast
      toast({
        title: "Refresh Failed",
        description: "There was an error refreshing the directory",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleBulkImportComplete = (newAgents: Agent[]) => {
    console.log(`DirectoryGrid: Bulk import complete, received ${newAgents.length} agents`);
    setShowBulkImport(false);
    
    // Refresh the agent list after bulk import
    fetchAgents();
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${newAgents.length} projects.`,
    });
  };
  
  const handleAddRepository = async (url: string) => {
    setIsSubmitting(true);
    try {
      console.log(`DirectoryGrid: Adding repository from URL: ${url}`);
      
      // Check if already exists in current state to provide fast feedback
      const normalizedUrl = url.toLowerCase().trim();
      if (agents.some(agent => agent.url?.toLowerCase().trim() === normalizedUrl)) {
        toast({
          title: "Repository Already Exists",
          description: "This repository is already in the directory.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        setShowAddForm(false);
        return;
      }
      
      // Attempt to add via GitHubService
      const result = await GitHubService.addProjectFromGitHub(url);
      
      if (result.success) {
        console.log(`DirectoryGrid: Repository added successfully from URL: ${url}`);
        
        // Trigger a full refresh from Supabase instead of updating local state directly
        fetchAgents();
        
        toast({
          title: "Repository Added",
          description: "The repository has been added to the directory.",
        });
      } else {
        console.error(`DirectoryGrid: Failed to add repository: ${result.error}`);
        toast({
          title: "Error Adding Repository",
          description: result.error || "Failed to add repository. It may already exist or is invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('DirectoryGrid: Error adding repository:', error);
      toast({
        title: "Error Adding Repository",
        description: "An unexpected error occurred while adding the repository.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowAddForm(false);
    }
  };
  
  // Get paginated data
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAgents.slice(startIndex, endIndex);
  }, [filteredAgents, currentPage, pageSize]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAgents.length / pageSize);
  }, [filteredAgents, pageSize]);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Add ellipsis after first page if there's a gap
    if (currentPage > 3) {
      pageNumbers.push(-1); // Use -1 as a marker for ellipsis
    }
    
    // Current page and immediate neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis before last page if there's a gap
    if (currentPage < totalPages - 2) {
      pageNumbers.push(-2); // Use -2 as another marker for ellipsis
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Remove duplicates
    return [...new Set(pageNumbers)];
  };
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Scroll to top of directory when changing pages
    window.scrollTo({
      top: document.getElementById('directory')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };
  
  // Handle page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Function to just get the count without fetching all projects
  const getProjectCount = async () => {
    try {
      const { count, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error getting project count:', error);
        return;
      }
      
      if (count !== null) {
        console.log(`Total projects in database: ${count}`);
        // Update a separate state for total count
        setTotalProjectCount(count);
      }
    } catch (error) {
      console.error('Error getting project count:', error);
    }
  };
  
  // Initial fetch of agents
  useEffect(() => {
    fetchAgents();
    
    // Set up interval to refresh the count every minute
    const refreshInterval = setInterval(() => {
      console.log('Refreshing agent count from Supabase');
      // Just fetch the count to update the total number
      getProjectCount();
    }, 60000); // Every minute
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  return (
    <div id="directory" className="w-full relative">
      <div className="bg-gradient-to-r from-[#0c0e20] to-[#161a36] backdrop-blur-md border-b border-white/10 p-4 flex flex-col md:flex-row md:items-center gap-y-4 justify-between">
        <div className="flex items-center">
          <div className="flex items-center bg-white/5 rounded-lg p-1.5 backdrop-blur-sm border border-white/10 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
            </svg>
          </div>
          
          <div>
            <h2 className="font-semibold text-white text-lg">AI Agent Directory</h2>
            <div className="text-xs text-white/60 font-medium">
              Showing <span className="text-indigo-400 font-semibold">{paginatedAgents.length}</span> of <span className="text-indigo-400 font-semibold">{totalProjectCount || filteredAgents.length}</span> total projects
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
          <div className="bg-gray-900 rounded-md border border-white/10 flex items-center shadow-sm hover:shadow-md transition-all duration-200 h-8">
            <select
              value={filterOptions.sort}
              onChange={(e) => handleFilterChange({ sort: e.target.value as SortOption })}
              className="h-8 rounded-md bg-transparent text-white border-none text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none px-3 py-1 cursor-pointer"
            >
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Primary action group */}
            <div className="flex items-center space-x-3">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setShowAddForm(true)}
                disabled={isLoading || isRefreshing}
                className="transition-all duration-200 shadow-sm hover:shadow-md relative bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Project</span>
              </Button>
              
              <Button
                variant="dark"
                size="sm"
                onClick={() => setShowBulkImport(true)}
                disabled={isLoading || isRefreshing}
                className="relative shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="sr-only">Bulk Import</span>
                Bulk
              </Button>
            </div>
            
            {/* Secondary action group */}
            <div className="flex items-center ml-2 space-x-2">
              {/* Refresh button hidden for now but code preserved */}
              {/* <Button
                variant="dark"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="relative px-3 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button> */}
              
              <Button
                variant="dark"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                disabled={isLoading || isRefreshing}
                className={`relative shadow-sm hover:shadow-md ${showFilters ? 'bg-indigo-500 border-indigo-400' : ''}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
                {(filterOptions.language || filterOptions.license) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full border border-white/20"></span>
                )}
              </Button>
              
              <Button
                variant="dark"
                size="sm"
                onClick={() => setShowTokenInput(!showTokenInput)}
                disabled={isLoading || isRefreshing}
                className="relative shadow-sm hover:shadow-md"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub Token</span>
                {!githubToken && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full border border-white/20"></span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-[#161a36]/80 backdrop-blur-md border-b border-white/10 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-white/60 mb-1.5">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={filterOptions.searchQuery}
                onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                className="w-full h-9 rounded-md border border-white/20 bg-white/5 px-9 py-1 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              {filterOptions.searchQuery && (
                <button 
                  onClick={() => handleFilterChange({ searchQuery: '' })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-4">
            <div className="w-full md:w-40">
              <label className="block text-xs font-medium text-white/60 mb-1.5">Language</label>
              <select 
                className="w-full h-9 rounded-md border border-white/20 bg-white/5 px-3 py-1 text-sm text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none cursor-pointer"
                value={filterOptions.language || ''}
                onChange={(e) => handleFilterChange({ language: e.target.value || '' })}
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-40">
              <label className="block text-xs font-medium text-white/60 mb-1.5">License</label>
              <select 
                className="w-full h-9 rounded-md border border-white/20 bg-white/5 px-3 py-1 text-sm text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none cursor-pointer"
                value={filterOptions.license || ''}
                onChange={(e) => handleFilterChange({ license: e.target.value || '' })}
              >
                <option value="">All Licenses</option>
                {licenses.map(license => (
                  <option key={license} value={license}>{license}</option>
                ))}
              </select>
            </div>
            
            {(filterOptions.language || filterOptions.license || filterOptions.searchQuery) && (
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleFilterChange({ language: '', license: '', searchQuery: '' })}
                  className="h-9 border-white/20 text-white/80 hover:text-white"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {showTokenInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-lg relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2" 
              onClick={() => setShowTokenInput(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-bold mb-4">Enter GitHub Token</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Providing a GitHub token will allow you to search GitHub's API with higher rate limits.
              Your token is stored only in your browser's localStorage.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="GitHub Personal Access Token"
                className="flex-1"
              />
              <Button 
                onClick={handleSaveToken}
                size="sm" 
                className="px-2 text-xs"
              >
                Save
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Token is stored in your browser's localStorage and is not sent to our servers.
            </p>
          </div>
        </div>
      )}
      
      {showAddForm && (
        <AddRepositoryDialog
          onAdd={handleAddRepository}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isSubmitting}
        />
      )}
      
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onProjectsAdded={(projects) => {
          if (projects && projects.length > 0) {
            console.log(`Projects added via bulk import: ${projects.length}. Refreshing from Supabase...`);
            
            // Give Supabase a moment to update
            setTimeout(() => {
              fetchAgents();
            }, 500);
            
            toast({
              title: 'Projects Added',
              description: `Successfully added ${projects.length} projects to the directory.`,
            });
          }
        }}
        existingProjectUrls={agents.map(agent => agent.url || '')}
      />
      
      {error && (
        <div className="mb-6 p-4 border border-red-400 rounded-md bg-red-50 text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mb-4"></div>
          <p className="text-lg">Loading directory...</p>
        </div>
      ) : paginatedAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-lg mb-2">No projects found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters or add some new projects
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              <span className="sr-only">Add Project</span>
              Add
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImport(true)}>
              Import from GitHub
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAgents.map((agent, index) => (
              <AgentCard key={`${agent.url}-${index}`} agent={agent} />
            ))}
          </div>
          <div className="flex justify-between items-center mt-8 mb-4">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="dark"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="shadow-sm hover:shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              
              {getPageNumbers().map(page => (
                page === -1 || page === -2 ? (
                  <span key={page} className="text-white/60 px-1">...</span>
                ) : (
                  <Button
                    key={page}
                    variant="dark"
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={currentPage === page}
                    className={`shadow-sm hover:shadow-md ${currentPage === page ? 'bg-indigo-500 border-indigo-400' : ''}`}
                  >
                    {page}
                  </Button>
                )
              ))}
              
              <Button
                variant="dark"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="shadow-sm hover:shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="h-8 rounded-md border border-white/20 bg-white/5 text-white text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none px-3 py-1 cursor-pointer"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-white/60 mt-2">
            Showing {paginatedAgents.length} of {filteredAgents.length} projects ({totalProjectCount} total in database)
          </p>
        </div>
      )}
    </div>
  );
};

export default DirectoryGrid;
