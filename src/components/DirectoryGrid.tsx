import { useState, useEffect, useRef, useMemo } from 'react';
import AgentCard from './AgentCard';
import { Agent, FilterOptions, SortOption } from '../types';
import Filters from './Filters';
import { GitHubService, REAL_PROJECTS } from '../services/GitHubService';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import PaginationControl from './PaginationControl';
import { paginateData } from '../utils/pagination';
import { toast } from '@/components/ui/use-toast';
import AddProjectForm from './AddProjectForm';
import BulkImportModal from './BulkImportModal';
import { Search, PlusCircle, RefreshCw, Sparkles, Database, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Github } from 'lucide-react';

interface DirectoryGridProps {
  initialSearchQuery?: string;
}

const DirectoryGrid = ({ initialSearchQuery = '' }: DirectoryGridProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [licenses, setLicenses] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    language: null,
    license: null,
    sort: 'stars',
    searchQuery: initialSearchQuery,
  });
  const [error, setError] = useState<string | null>(null);
  const directoryRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;
  
  const totalPages = useMemo(() => {
    if (filteredAgents.length === 0) return 1;
    return Math.ceil(filteredAgents.length / pageSize);
  }, [filteredAgents, pageSize]);
  
  const currentPageData = useMemo(() => {
    return paginateData(filteredAgents, page, pageSize);
  }, [filteredAgents, page, pageSize]);

  // GitHub token state
  const [githubToken, setGithubToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  useEffect(() => {
    // Check if token exists in localStorage on component mount
    const savedToken = localStorage.getItem('github_token') || '';
    setGithubToken(savedToken);
  }, []);

  const handleSaveToken = () => {
    if (githubToken.trim()) {
      localStorage.setItem('github_token', githubToken.trim());
      toast({
        title: "GitHub Token Saved",
        description: "Your GitHub token has been saved. The application will now use it for API requests.",
      });
      setShowTokenInput(false);
      // Refresh data with the new token
      handleRefresh();
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid GitHub token.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        setAgents(Array(pageSize).fill(null).map((_, i: number) => ({
          id: `loading-${i}`,
          name: 'Loading...',
          description: 'Loading agent information...',
          stars: 0,
          forks: 0,
          url: '',
          owner: '',
          avatar: '',
          language: '',
          updated: '',
          topics: [],
          license: '',
          isLoading: true
        })));

        console.log('Fetching agent data...');
        let fetchedAgents: Agent[] = [];
        
        try {
          console.log('DirectoryGrid: Fetching agents from GitHubService');
          
          // First try to use fallback data to ensure something displays
          fetchedAgents = REAL_PROJECTS;
          
          // Then try to get API data if a token is available
          if (localStorage.getItem('github_token')) {
            const agentData = await GitHubService.getAgentData(githubToken);
            if (agentData && agentData.agents && agentData.agents.length > 0) {
              fetchedAgents = agentData.agents;
              console.log(`DirectoryGrid: Fetched ${fetchedAgents.length} agents from service`);
            }
          } else {
            console.log('No GitHub token available. Using preloaded data.');
          }
        } catch (fetchError: any) {
          console.error('Error fetching agents:', fetchError);
          setError('Failed to load agent data. Using fallback data.');
          
          // Ensure we have fallback data
          if (!fetchedAgents || fetchedAgents.length === 0) {
            console.log('DirectoryGrid: Using fallback data');
            fetchedAgents = REAL_PROJECTS;
          }
        }
        
        // Ensure we have valid data
        if (!Array.isArray(fetchedAgents)) {
          console.error('Invalid agent data received:', fetchedAgents);
          fetchedAgents = [];
        }
        
        // Extract unique languages and licenses for filtering
        const uniqueLanguages = Array.from(new Set(
          fetchedAgents
            .map(agent => agent.language)
            .filter(Boolean)
        )).sort();
        
        const uniqueLicenses = Array.from(new Set(
          fetchedAgents
            .map(agent => agent.license)
            .filter(Boolean)
        )).sort();
        
        console.log(`Loaded ${fetchedAgents.length} agents with ${uniqueLanguages.length} languages and ${uniqueLicenses.length} licenses`);
        setLanguages(uniqueLanguages);
        setLicenses(uniqueLicenses);
        setAgents(fetchedAgents);
        setFilteredAgents(fetchedAgents);
        
        // Apply initial search query if provided
        if (initialSearchQuery) {
          handleSearch(initialSearchQuery);
        }
      } catch (err: any) {
        console.error('Error in loadAgents:', err);
        setError('Failed to load agent data. Please try again later.');
        
        // Set empty arrays to prevent further errors
        setAgents([]);
        setFilteredAgents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [initialSearchQuery, githubToken]);

  // Apply filtering and sorting when agents or filter options change
  useEffect(() => {
    console.log("Filtering with options:", filterOptions);
    
    if (!agents || agents.length === 0) {
      console.log("No agents to filter");
      setFilteredAgents([]);
      return;
    }
    
    try {
      // Only filter if we have agents to filter
      if (!agents || agents.length === 0) {
        setFilteredAgents([]);
        return;
      }
      
      console.log(`DirectoryGrid: Filtering ${agents.length} agents with search "${filterOptions.searchQuery}" and language "${filterOptions.language}"`);
      
      // Step 1: Apply search filter if searchQuery exists
      let filtered = agents;
      
      if (filterOptions.searchQuery && filterOptions.searchQuery.trim() !== '') {
        const normalizedQuery = filterOptions.searchQuery.toLowerCase().trim();
        const searchTerms = normalizedQuery.split(/\s+/);
        
        console.log(`DirectoryGrid: Search terms: ${JSON.stringify(searchTerms)}`);
        
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
        
        console.log(`DirectoryGrid: After search filtering, ${filtered.length} agents remain`);
      }
      
      // Step 2: Apply language filter if selectedLanguage exists
      if (filterOptions.language) {
        const normalizedLanguage = filterOptions.language.toLowerCase();
        
        filtered = filtered.filter(agent => {
          const language = agent.language?.toLowerCase() || '';
          return language === normalizedLanguage;
        });
        
        console.log(`DirectoryGrid: After language filtering, ${filtered.length} agents remain`);
      }
      
      // Step 3: Apply license filter if selectedLicense exists
      if (filterOptions.license) {
        const normalizedLicense = filterOptions.license.toLowerCase();
        
        filtered = filtered.filter(agent => {
          const license = agent.license?.toLowerCase() || '';
          return license === normalizedLicense;
        });
        
        console.log(`DirectoryGrid: After license filtering, ${filtered.length} agents remain`);
      }
      
      // Step 4: Sort the filtered agents
      const sorted = sortAgents(filtered, filterOptions.sort);
      
      console.log(`DirectoryGrid: After sorting, ${sorted.length} agents available`);
      
      // Update state with filtered and sorted agents
      setFilteredAgents(sorted);
    } catch (err: any) {
      console.error('Error filtering agents:', err);
      setError('Error filtering agent data. Showing all available agents.');
      
      // Fall back to showing all agents if filtering fails
      const sorted = sortAgents(agents, filterOptions.sort);
      setFilteredAgents(sorted);
    }
  }, [agents, filterOptions]);

  const sortAgents = (agents: Agent[], sort: SortOption): Agent[] => {
    switch (sort) {
      case 'stars':
        return [...agents].sort((a, b) => b.stars - a.stars);
      case 'forks':
        return [...agents].sort((a, b) => b.forks - a.forks);
      case 'updated':
        return [...agents].sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
      default:
        return agents;
    }
  };

  // Function to apply filters to a list of agents
  const applyFilters = (agents: Agent[], filters: FilterOptions): Agent[] => {
    let filtered = [...agents];
    
    // Apply language filter
    if (filters.language) {
      const normalizedLanguage = filters.language.toLowerCase();
      filtered = filtered.filter(agent => {
        const language = agent.language?.toLowerCase() || '';
        return language === normalizedLanguage;
      });
    }
    
    // Apply license filter
    if (filters.license) {
      const normalizedLicense = filters.license.toLowerCase();
      filtered = filtered.filter(agent => {
        const license = agent.license?.toLowerCase() || '';
        return license === normalizedLicense;
      });
    }
    
    // Apply sorting
    return sortAgents(filtered, filters.sort);
  };

  const handleSearch = (query: string) => {
    console.log("Search query changed:", query);
    setPage(1);
    setHasMore(true);
    setFilterOptions({ ...filterOptions, searchQuery: query, license: null });
  };

  const handleLanguageChange = (language: string | null) => {
    setPage(1);
    setHasMore(true);
    setFilterOptions({ ...filterOptions, language });
  };

  const handleLicenseChange = (license: string | null) => {
    setPage(1);
    setHasMore(true);
    setFilterOptions({ ...filterOptions, license });
  };

  const handleSortChange = (sort: SortOption) => {
    setFilterOptions({ ...filterOptions, sort });
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear cache to force a fresh load
      if (typeof window !== 'undefined' && window.__AGENT_CACHE__) {
        window.__AGENT_CACHE__.agents = null;
      }
      
      // Get fresh data
      const refreshedData = await GitHubService.getAgentData(githubToken);
      setAgents(refreshedData.agents);
      
      // Apply filters to the new data
      let filtered = [...refreshedData.agents];
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
      
      setFilteredAgents(sorted);
      
      toast({
        title: "Refresh Complete",
        description: `Successfully refreshed ${refreshedData.agents.length} projects.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBulkImport = async (projects: any) => {
    console.log("CRITICAL: Received bulk import with:", Array.isArray(projects) ? projects.length : "Not an array");
    
    // Force-clear any possible cache
    if (typeof window !== 'undefined') {
      if (window.__AGENT_CACHE__) {
        window.__AGENT_CACHE__ = null;
      }
      localStorage.removeItem('directory_projects');
    }
    
    // If we received projects directly, use them immediately
    if (Array.isArray(projects) && projects.length > 0) {
      console.log("CRITICAL: Using directly provided projects:", projects.length);
      setAgents(projects);
      setFilteredAgents(projects);
      return;
    }
    
    // Otherwise, force a complete reload of the page to guarantee fresh data
    console.log("CRITICAL: Projects not provided directly, forcing page reload");
    window.location.reload();
  };

  // Function to show/hide the bulk import modal
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Get list of existing project URLs to prevent duplicates
  const existingProjectUrls = useMemo(() => {
    return agents.map(agent => agent.url);
  }, [agents]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitProject = async (url: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await GitHubService.addProject(url);
      
      if (result.success && result.agent) {
        setAgents(prevAgents => [result.agent, ...prevAgents]);
        
        toast({
          title: "Project Added",
          description: `Successfully added ${result.agent.name} to the directory.`,
        });
        
        setShowAddForm(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add project.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="directory" ref={directoryRef} className="py-6 px-4 bg-gradient-to-b from-[#0e1129] to-[#1e2344]">
      <div className="max-w-5xl mx-auto">
        {/* Directory header with title and buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-white/10 pb-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">AI Agent Directory</h3>
            <span className="text-xs text-white/60 ml-1.5">
              {filteredAgents.length > 0 ? (
                <>Showing <span className="font-semibold text-indigo-400">{filteredAgents.length}</span> of <span className="font-semibold text-indigo-400">{agents.length}</span> total projects</>
              ) : isLoading ? (
                <span className="text-indigo-400">Loading...</span>
              ) : (
                <span className="text-red-400">No projects found</span>
              )}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full md:w-auto flex gap-2">
              <Select 
                value={filterOptions.sort} 
                onValueChange={(value: SortOption) => handleSortChange(value)}
              >
                <SelectTrigger className="h-7 text-xs bg-[#0e1129] border-white/10 text-white w-[120px] md:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f36] border-white/10 text-white">
                  <SelectItem value="stars" className="text-xs">Most Stars</SelectItem>
                  <SelectItem value="forks" className="text-xs">Most Forks</SelectItem>
                  <SelectItem value="updated" className="text-xs">Recently Updated</SelectItem>
                  <SelectItem value="name" className="text-xs">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs bg-[#0e1129] border-white/10 hover:bg-[#161b33] hover:text-white hover:border-white/20 text-white"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs bg-[#0e1129] border-white/10 hover:bg-[#161b33] hover:text-white hover:border-white/20 text-white"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Project
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs bg-[#0e1129] border-white/10 hover:bg-[#161b33] hover:text-white hover:border-white/20 text-white"
                onClick={() => setShowBulkImport(true)}
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Bulk Import
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs bg-[#0e1129] border-white/10 hover:bg-[#161b33] hover:text-white hover:border-white/20 text-white"
                onClick={() => setShowTokenInput(!showTokenInput)}
              >
                <Github className="h-3 w-3 mr-1" />
                GitHub Token
              </Button>
            </div>
          </div>
        </div>
        
        {/* GitHub Token Configuration */}
        {showTokenInput && (
          <div className="mt-2 p-4 bg-[#1a1f36] rounded-lg border border-white/10 max-w-md">
            <p className="text-sm text-gray-300 mb-2">
              Add your GitHub Personal Access Token to enable API searches.
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:underline"
              >
                Generate token here
              </a>
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
        )}
        
        {/* Filters row */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Filters:</span>
            <Select
              value={filterOptions.language}
              onValueChange={handleLanguageChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-auto border-white/20 bg-white/5 text-white text-xs h-7 px-2 rounded-sm">
                <SelectValue placeholder="Languages" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f36] border-white/10 text-white text-xs">
                <SelectItem value="all" className="text-xs">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-xs">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filterOptions.license}
              onValueChange={handleLicenseChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-auto border-white/20 bg-white/5 text-white text-xs h-7 px-2 rounded-sm">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f36] border-white/10 text-white text-xs">
                <SelectItem value="all" className="text-xs">All Licenses</SelectItem>
                {licenses.map((license) => (
                  <SelectItem key={license} value={license} className="text-xs">
                    {license}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/40" />
              <input
                type="text"
                placeholder="Search agents..."
                value={filterOptions.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-white/5 border border-white/20 rounded-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-white/40 text-xs h-7"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" />
            <h2 className="font-semibold text-white">Agent Directory</h2>
            <Badge variant="outline" className="rounded-sm text-white/70 text-[10px] h-5 border-white/10 ml-1 font-normal">
              {agents.length} agents
            </Badge>
          </div>
        </div>
        
        {/* Add project form */}
        {showAddForm && (
          <div className="mb-8 p-6 bg-[#1a1f36] rounded-xl border border-white/10">
            <AddProjectForm 
              onProjectAdded={handleSubmitProject}
              onClose={() => setShowAddForm(false)}
              isOpen={true}
            />
          </div>
        )}
        
        {/* Bulk import modal */}
        {showBulkImport && (
          <BulkImportModal
            isOpen={showBulkImport}
            onClose={() => setShowBulkImport(false)}
            onProjectsAdded={handleBulkImport}
            existingProjectUrls={existingProjectUrls}
          />
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {filteredAgents.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#1a1f36] rounded-xl border border-white/10">
            <div className="mb-4 text-white/30">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
            <p className="text-white/60 max-w-md text-[10px]">
              We couldn't find any AI agent projects matching your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(isLoading && page === 1 ? agents : currentPageData).map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            
            {filteredAgents.length > 0 && (
              <div className="mt-12">
                <PaginationControl 
                  currentPage={page} 
                  totalPages={totalPages} 
                  onPageChange={handlePageChange} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DirectoryGrid;
