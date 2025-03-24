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
  Github
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
      
      if (data && data.length > 0) {
        data.forEach(project => {
          if (project.url) {
            const normalizedUrl = project.url.toLowerCase().trim();
            if (!seenUrls.has(normalizedUrl)) {
              seenUrls.add(normalizedUrl);
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
      
      // Set agents regardless of whether they're empty
      setAgents(uniqueProjects);
      setFilteredAgents(uniqueProjects);
      
      // Only show a toast if we actually have data
      if (uniqueProjects.length > 0) {
        toast({
          title: "Data Loaded",
          description: `Successfully loaded ${uniqueProjects.length} projects from database.`,
        });
      } else {
        // If Supabase returned empty data, let user know database is empty
        toast({
          title: "Database Empty",
          description: "The Supabase database is empty. You can add projects to populate it.",
        });
      }
    } catch (err) {
      console.error('DirectoryGrid: Error fetching agents:', err);
      toast({
        title: "Error Loading Data",
        description: "Failed to fetch data from database. See console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Initial data fetch
    console.log('DirectoryGrid: Initial component mount, fetching data');
    fetchAgents();
    
    // Set up localStorage listener to detect changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'directory_updated') {
        console.log('DirectoryGrid: Storage change detected, refreshing data');
        fetchAgents();
      }
    };
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    console.log('DirectoryGrid: Filter options changed, applying filters');
    applyFilters();
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
    setError(null);
    
    try {
      // First check if this repository is already in our directory
      const isDuplicate = agents.some(agent => 
        agent.url && agent.url.toLowerCase() === url.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        toast({
          title: 'Duplicate Repository',
          description: 'This repository already exists in the directory.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // If not a duplicate, proceed with adding
      const result = await GitHubService.addProject(url);
      
      if (result.success && result.agent) {
        // Then save to our database
        const supabaseService = SupabaseService.getInstance();
        const added = await supabaseService.addProject(result.agent);
        
        if (!added) {
          toast({
            title: 'Duplicate Repository',
            description: 'This repository already exists in the directory.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        
        // Update state
        setAgents(prevAgents => [result.agent, ...prevAgents]);
        setFilteredAgents(prevAgents => [result.agent, ...prevAgents]);
        
        setShowAddForm(false);
        toast({
          title: 'Project Added',
          description: `Successfully added ${result.agent.name} to the directory.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add repository.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding repository:', error);
      toast({
        title: 'Error',
        description: 'Failed to add repository. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
              Showing <span className="text-indigo-400 font-semibold">{filteredAgents.length}</span> of <span className="text-indigo-400 font-semibold">{agents.length}</span> total projects
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
          <div className="bg-gray-900 rounded-md border border-white/10 flex items-center shadow-sm hover:shadow-md transition-all duration-200 h-8">
            <select
              value={filterOptions.sort}
              onChange={(e) => handleFilterChange({ sort: e.target.value as SortOption })}
              className="h-8 rounded-md bg-transparent text-white border-none text-sm focus:ring-1 focus:ring-indigo-400 focus:outline-none px-3 py-0 cursor-pointer"
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
                className="transition-all duration-200 shadow-sm hover:shadow-md px-3 relative bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                <span className="font-medium">Add Project</span>
              </Button>
              
              <Button
                variant="dark"
                size="sm"
                onClick={() => setShowBulkImport(true)}
                disabled={isLoading || isRefreshing}
                className="relative px-3 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
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
                className={`relative px-3 transition-all duration-200 shadow-sm hover:shadow-md ${showFilters ? 'bg-indigo-500 border-indigo-400' : ''}`}
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
                className="relative px-3 transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="w-full h-9 rounded-md border border-white/20 bg-white/5 px-3 py-1 text-sm text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all duration-200"
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
                className="w-full h-9 rounded-md border border-white/20 bg-white/5 px-3 py-1 text-sm text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all duration-200"
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
            // Add projects to state
            setAgents(prevAgents => [...projects, ...prevAgents]);
            setFilteredAgents(prevAgents => [...projects, ...prevAgents]);
            // Show success message
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
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-lg mb-2">No projects found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters or add some new projects
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Project
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImport(true)}>
              Import from GitHub
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <AgentCard key={`${agent.url}-${index}`} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectoryGrid;
