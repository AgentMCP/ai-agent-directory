import { useState, useEffect, useRef, useMemo } from 'react';
import AgentCard from './AgentCard';
import { Agent, FilterOptions, SortOption } from '../types';
import Filters from './Filters';
import { GitHubService } from '../services/GitHubService';
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
  const directoryRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 24;
  
  const totalPages = useMemo(() => {
    if (filteredAgents.length === 0) return 1;
    return Math.ceil(filteredAgents.length / pageSize);
  }, [filteredAgents, pageSize]);
  
  const currentPageData = useMemo(() => {
    return paginateData(filteredAgents, page, pageSize);
  }, [filteredAgents, page, pageSize]);

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        setAgents(Array(pageSize).fill(null).map((_, i) => ({
          id: `loading-${i}`,
          name: '',
          description: '',
          url: '',
          stars: 0,
          forks: 0,
          language: '',
          license: '',
          updated: '',
          isLoading: true,
          topics: [],
          owner: '',
          avatar: ''
        })));

        console.log('Fetching agent data...');
        const data = await GitHubService.getAgentData();
        
        if (!data || !data.agents) {
          throw new Error('No agent data returned');
        }
        
        console.log(`Successfully loaded ${data.agents.length} agents from GitHubService`);
        
        // Extract unique languages and licenses for filtering
        const uniqueLanguages = Array.from(new Set(
          data.agents
            .map(agent => agent.language)
            .filter(Boolean)
        )).sort();
        
        const uniqueLicenses = Array.from(new Set(
          data.agents
            .map(agent => agent.license)
            .filter(Boolean)
        )).sort();
        
        console.log(`Loaded ${data.agents.length} agents with ${uniqueLanguages.length} languages and ${uniqueLicenses.length} licenses`);
        setLanguages(uniqueLanguages);
        setLicenses(uniqueLicenses);
        setAgents(data.agents);
        setFilteredAgents(data.agents);
        
        // Apply initial search query if provided
        if (initialSearchQuery) {
          handleSearch(initialSearchQuery);
        }
      } catch (error) {
        console.error('Error loading agents:', error);
        toast({
          title: "Error",
          description: "Failed to load AI agents. Please try again later.",
          variant: "destructive",
        });
        // Set empty arrays to prevent undefined errors
        setAgents([]);
        setFilteredAgents([]);
        setLanguages([]);
        setLicenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [initialSearchQuery]);

  // Apply filtering and sorting when agents or filter options change
  useEffect(() => {
    console.log("Filtering with options:", filterOptions);
    
    if (!agents || agents.length === 0) {
      console.log("No agents to filter");
      setFilteredAgents([]);
      return;
    }
    
    try {
      let filtered = [...agents];
      
      // Apply search filter first
      if (filterOptions.searchQuery && filterOptions.searchQuery.trim() !== '') {
        console.log("Applying search filter:", filterOptions.searchQuery);
        
        const searchQuery = filterOptions.searchQuery.toLowerCase().trim();
        
        filtered = filtered.filter(agent => {
          if (!agent || agent.isLoading) return false;
          
          const nameMatch = agent.name?.toLowerCase().includes(searchQuery);
          const descMatch = agent.description?.toLowerCase().includes(searchQuery);
          const langMatch = agent.language?.toLowerCase().includes(searchQuery);
          const licenseMatch = agent.license?.toLowerCase().includes(searchQuery);
          
          return nameMatch || descMatch || langMatch || licenseMatch;
        });
        
        console.log(`Search filter applied, ${filtered.length} agents remaining`);
      } else {
        console.log("No search query to filter by");
      }
      
      // Then apply language filter
      if (filterOptions.language) {
        console.log("Applying language filter:", filterOptions.language);
        
        filtered = filtered.filter(agent => 
          agent.language === filterOptions.language
        );
        
        console.log(`Language filter applied, ${filtered.length} agents remaining`);
      }
      
      // Then apply license filter
      if (filterOptions.license) {
        console.log("Applying license filter:", filterOptions.license);
        
        filtered = filtered.filter(agent => 
          agent.license === filterOptions.license
        );
        
        console.log(`License filter applied, ${filtered.length} agents remaining`);
      }
      
      // Finally sort
      console.log("Applying sort:", filterOptions.sort);
      filtered = sortAgents(filtered, filterOptions.sort);
      
      console.log(`Final filtered result: ${filtered.length} agents`);
      setFilteredAgents(filtered);
      
      // Reset to first page when filters change
      setPage(1);
    } catch (error) {
      console.error("Error during filtering:", error);
      // Fallback to showing all agents if filtering fails
      setFilteredAgents(agents);
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
      const data = await GitHubService.refreshAgentData();
      setAgents(data.agents);
      applyFilters(data.agents, filterOptions);
      
      toast({
        title: "Refresh Complete",
        description: `Successfully refreshed ${data.agents.length} projects.`,
        variant: "default",
      });
    } catch (error) {
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

  const applyFilters = (agents: Agent[], filterOptions: FilterOptions) => {
    let filtered = [...agents];
    
    // Apply search filter first
    if (filterOptions.searchQuery && filterOptions.searchQuery.trim() !== '') {
      console.log("Applying search filter:", filterOptions.searchQuery);
      
      const searchQuery = filterOptions.searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(agent => {
        if (!agent || agent.isLoading) return false;
        
        const nameMatch = agent.name?.toLowerCase().includes(searchQuery);
        const descMatch = agent.description?.toLowerCase().includes(searchQuery);
        const langMatch = agent.language?.toLowerCase().includes(searchQuery);
        const licenseMatch = agent.license?.toLowerCase().includes(searchQuery);
        
        return nameMatch || descMatch || langMatch || licenseMatch;
      });
      
      console.log(`Search filter applied, ${filtered.length} agents remaining`);
    } else {
      console.log("No search query to filter by");
    }
    
    // Then apply language filter
    if (filterOptions.language) {
      console.log("Applying language filter:", filterOptions.language);
      
      filtered = filtered.filter(agent => 
        agent.language === filterOptions.language
      );
      
      console.log(`Language filter applied, ${filtered.length} agents remaining`);
    }
    
    // Then apply license filter
    if (filterOptions.license) {
      console.log("Applying license filter:", filterOptions.license);
      
      filtered = filtered.filter(agent => 
        agent.license === filterOptions.license
      );
      
      console.log(`License filter applied, ${filtered.length} agents remaining`);
    }
    
    // Finally sort
    console.log("Applying sort:", filterOptions.sort);
    filtered = sortAgents(filtered, filterOptions.sort);
    
    console.log(`Final filtered result: ${filtered.length} agents`);
    setFilteredAgents(filtered);
  };

  // Handle adding a project
  const handleProjectAdded = async (url: string) => {
    try {
      const newAgent = await GitHubService.addProject(url);
      
      if (newAgent) {
        setAgents(prevAgents => {
          // Check if the agent already exists
          const exists = prevAgents.some(agent => agent.url === newAgent.url);
          if (exists) {
            toast({
              title: "Already exists",
              description: "This project is already in the directory.",
            });
            return prevAgents;
          }
          
          // Add the new agent
          const updated = [newAgent, ...prevAgents];
          return updated;
        });
        
        toast({
          title: "Success",
          description: "Project added successfully!",
        });
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to add project. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding multiple projects
  const handleBulkProjectsAdded = (count: number) => {
    // Update the UI after bulk projects are added
    if (count > 0) {
      toast({
        title: "Success!",
        description: `Added ${count} new projects to the directory.`,
        variant: "default",
      });
      
      // Refresh the data
      handleRefresh();
    }
  };

  // Get list of existing project URLs to prevent duplicates
  const existingProjectUrls = useMemo(() => {
    return agents.map(agent => agent.url);
  }, [agents]);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

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
                onClick={() => setIsAddProjectModalOpen(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Project
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs bg-[#0e1129] border-white/10 hover:bg-[#161b33] hover:text-white hover:border-white/20 text-white"
                onClick={() => setIsBulkImportModalOpen(true)}
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Bulk Import
              </Button>
            </div>
          </div>
        </div>
        
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
      {isAddProjectModalOpen && (
        <AddProjectForm 
          isOpen={isAddProjectModalOpen}
          onProjectAdded={handleProjectAdded}
          onClose={() => setIsAddProjectModalOpen(false)}
        />
      )}
      {isBulkImportModalOpen && (
        <BulkImportModal 
          isOpen={isBulkImportModalOpen}
          onProjectsAdded={handleBulkProjectsAdded}
          existingProjectUrls={existingProjectUrls}
          onClose={() => setIsBulkImportModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DirectoryGrid;
