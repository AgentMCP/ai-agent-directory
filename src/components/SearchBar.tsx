import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, RefreshCw, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { GitHubService } from '../services/GitHubService';
import { Agent } from '../types';
import { debounce } from 'lodash';

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
  onRefresh?: () => void;
  onAddProject?: () => void;
  lastUpdated?: string;
  isSticky?: boolean;
  isCompact?: boolean;
}

const SearchBar = ({ 
  defaultValue = '', 
  onSearch, 
  onRefresh, 
  onAddProject,
  lastUpdated,
  isSticky = false,
  isCompact = false
}: SearchBarProps) => {
  const [query, setQuery] = useState(defaultValue);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Common search terms for AI agents
  const commonSearchTerms = [
    'autonomous agent', 'llm agent', 'ai assistant', 
    'agent framework', 'mcp', 'model context protocol',
    'multi-agent', 'agent orchestration'
  ];

  useEffect(() => {
    setQuery(defaultValue);
    if (defaultValue) {
      setSearchTerms(defaultValue.split(' ').filter(term => term.trim() !== ''));
    }
  }, [defaultValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search suggestion function
  const debouncedGetSuggestions = useCallback(
    debounce((searchText: string) => {
      if (searchText.length < 2) {
        setSuggestions([]);
        return;
      }

      const matchedSuggestions = commonSearchTerms
        .filter(term => term.toLowerCase().includes(searchText.toLowerCase()))
        .slice(0, 5);
      
      setSuggestions(matchedSuggestions);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const terms = query.split(' ').filter(term => term.trim() !== '');
    setSearchTerms(terms);
    onSearch(query);
    setShowSuggestions(false);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsSearching(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }, 500);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchTerms([]);
    setSuggestions([]);
    
    // Explicitly call onSearch with empty string to reset the directory
    onSearch('');
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      
      // Reset the refreshing state after animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const removeSearchTerm = (termToRemove: string) => {
    const newTerms = searchTerms.filter(term => term !== termToRemove);
    setSearchTerms(newTerms);
    const newQuery = newTerms.join(' ');
    setQuery(newQuery);
    onSearch(newQuery);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSearchTerms([suggestion]);
    onSearch(suggestion);
    setShowSuggestions(false);
    setIsSearching(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  return (
    <div 
      className={`w-full transition-all duration-300 ${
        isSticky 
          ? 'sticky top-20 z-30 py-2 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : ''
      }`}
    >
      <form 
        onSubmit={handleSubmit}
        className={`relative ${isCompact ? 'max-w-xl mx-auto' : 'max-w-2xl mx-auto'}`}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Search className={`h-4 w-4 transition-colors ${isFocused ? 'text-primary' : 'text-gray-400'}`} />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            className={`block w-full pl-10 pr-10 ${isCompact ? 'py-3 text-sm' : 'py-4'} border rounded-full bg-white/90 transition-all duration-200 ${
              isFocused 
                ? 'border-primary shadow-md ring-1 ring-primary/20' 
                : 'border-gray-200 shadow-sm'
            }`}
            placeholder="Search AI agents, libraries, or tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-24 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {onAddProject && (
            <button
              type="button"
              onClick={onAddProject}
              className="absolute inset-y-0 right-12 flex items-center text-gray-400 hover:text-gray-600 transition-colors px-2"
              title="Add new project"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          {onRefresh && !onAddProject && (
            <button
              type="button"
              onClick={handleRefresh}
              className="absolute inset-y-0 right-12 flex items-center text-gray-400 hover:text-gray-600 transition-colors px-2"
              title="Refresh agent directory"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            type="submit"
            className={`absolute inset-y-0 right-0 flex items-center px-6 text-white bg-primary rounded-r-full hover:opacity-90 transition-colors ${isCompact ? 'text-sm' : ''} ${isSearching ? 'opacity-80' : ''}`}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Search suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div 
                key={`${suggestion}-${index}`}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  <Search className="h-3 w-3 text-gray-400 mr-2" />
                  <span>{suggestion}</span>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </div>
            ))}
          </div>
        )}
        
        {/* Search term bubbles */}
        {searchTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {searchTerms.map((term, index) => (
              <div 
                key={`${term}-${index}`} 
                className="flex items-center bg-secondary text-primary text-xs px-2 py-0.5 rounded-full"
              >
                <span>{term}</span>
                <button 
                  type="button" 
                  onClick={() => removeSearchTerm(term)}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {lastUpdated && !isCompact && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            Last updated: {lastUpdated}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
