import { useState, useEffect, useRef, useMemo } from 'react';
import AgentCard from './AgentCard';
import { Agent, FilterOptions, SortOption } from '../types';
import Filters from './Filters';
import { GitHubService } from '../services/GitHubService';
import { Button } from './ui/button';
import PaginationControl from './PaginationControl';
import { paginateData } from '../utils/pagination';
import { toast } from '@/components/ui/use-toast';
import AddProjectForm from './AddProjectForm';
import BulkImportModal from './BulkImportModal';
import { Search, PlusCircle } from 'lucide-react';

interface DirectoryGridProps {
  initialSearchQuery?: string;
}

const DirectoryGrid = ({ initialSearchQuery = '' }: DirectoryGridProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    language: null,
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

        const data = await GitHubService.fetchAgents();
        
        const uniqueLanguages = Array.from(new Set(data.map(agent => agent.language))).sort();
        setLanguages(uniqueLanguages);
        
        setAgents(data);
        setFilteredAgents(data); // Initialize filtered agents with all agents
      } catch (error) {
        console.error('Error loading agents:', error);
        toast({
          title: "Error",
          description: "Failed to load AI agents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
    
    const autoRefreshInterval = setInterval(() => {
      handleRefresh();
    }, 24 * 60 * 60 * 1000);
    
    return () => {
      clearInterval(autoRefreshInterval);
    };
  }, []);

  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery !== '' && !isLoading) {
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery, isLoading]);

  useEffect(() => {
    if (isLoading || agents.some(agent => agent.isLoading)) {
      return; // Skip filtering if still loading
    }
    
    console.log("Applying filters:", filterOptions);
    
    const applyFilters = async () => {
      setIsLoading(true);
      
      try {
        let result = [...agents];
        
        // Apply search if query exists
        if (filterOptions.searchQuery && filterOptions.searchQuery.trim() !== '') {
          const searchQuery = filterOptions.searchQuery.trim().toLowerCase();
          const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0);
          
          console.log("Searching for terms:", searchTerms);
          
          if (searchTerms.length > 0) {
            result = result.filter(agent => {
              const name = agent.name.toLowerCase();
              const description = agent.description.toLowerCase();
              const topics = agent.topics.map(topic => topic.toLowerCase());
              
              return searchTerms.some(term => 
                name.includes(term) || 
                description.includes(term) || 
                topics.some(topic => topic.includes(term))
              );
            });
            
            console.log(`Found ${result.length} results for "${searchQuery}"`);
          }
        } else {
          // If search is cleared, reset to show all agents
          console.log("Search cleared, showing all agents");
          result = [...agents];
        }
        
        // Apply language filter if selected
        if (filterOptions.language) {
          result = result.filter(agent => agent.language === filterOptions.language);
          console.log(`After language filter "${filterOptions.language}": ${result.length} results`);
        }
        
        // Sort the results
        result = sortAgents(result, filterOptions.sort);
        console.log(`After sorting by "${filterOptions.sort}": ${result.length} results`);
        
        setFilteredAgents(result);
        setPage(1);
      } catch (error) {
        console.error("Error applying filters:", error);
        toast({
          title: "Error",
          description: "Failed to filter results. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    applyFilters();
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
    console.log("Search triggered with query:", query);
    setPage(1);
    setHasMore(true);
    setFilterOptions(prev => ({ ...prev, searchQuery: query }));
  };

  const handleLanguageChange = (language: string | null) => {
    setPage(1);
    setHasMore(true);
    setFilterOptions({ ...filterOptions, language });
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
      const response = await GitHubService.refreshAgentData();
      
      setAgents(response.agents);
      
      toast({
        title: "Success",
        description: "AI agent directory has been refreshed with the latest data.",
      });
    } catch (error) {
      console.error('Error refreshing agents:', error);
      toast({
        title: "Error",
        description: "Failed to refresh agent data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleProjectAdded = (newAgent: Agent) => {
    setAgents(prevAgents => [newAgent, ...prevAgents]);
    
    toast({
      title: "Success",
      description: `${newAgent.name} has been added to the directory.`,
    });
  };
  
  const handleBulkProjectsAdded = (newAgents: Agent[]) => {
    if (newAgents && newAgents.length > 0) {
      setAgents(prevAgents => [...newAgents, ...prevAgents]);
      
      toast({
        title: "Success",
        description: `${newAgents.length} AI agent projects have been added to the directory.`,
      });
    }
  };

  const existingProjectUrls = useMemo(() => {
    return agents.map(agent => agent.url);
  }, [agents]);

  return (
    <div ref={directoryRef} className="mt-2 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredAgents.length} {filteredAgents.length === 1 ? 'project' : 'projects'}
              </div>
              
              <AddProjectForm onProjectAdded={handleProjectAdded} />
              
              <BulkImportModal 
                onProjectsAdded={handleBulkProjectsAdded}
                existingProjectUrls={existingProjectUrls}
              />
            </div>
          </div>
          
          <Filters
            onLanguageChange={handleLanguageChange}
            onSortChange={handleSortChange}
            selectedLanguage={filterOptions.language}
            selectedSort={filterOptions.sort}
            languages={languages}
          />
        </div>
        
        {filteredAgents.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl">
            <div className="mb-4 text-gray-400">
              <Search className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 max-w-md">
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
              <div className="mt-8">
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
