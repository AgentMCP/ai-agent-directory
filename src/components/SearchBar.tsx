import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
  onAddProject?: () => void;
  lastUpdated?: string;
  isSticky?: boolean;
  isCompact?: boolean;
}

const SearchBar = ({ 
  defaultValue = '', 
  onSearch, 
  onAddProject,
  lastUpdated,
  isSticky = false,
  isCompact = true 
}: SearchBarProps) => {
  const [query, setQuery] = useState(defaultValue);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
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

  const updateSuggestions = useCallback(
    debounce((input: string) => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      // Filter common search terms based on input
      const filtered = commonSearchTerms.filter(term => 
        term.toLowerCase().includes(input.toLowerCase()) && 
        !searchTerms.includes(term)
      );

      // Limit to 5 suggestions
      setSuggestions(filtered.slice(0, 5));
    }, 200),
    [searchTerms]
  );

  useEffect(() => {
    updateSuggestions(query);
  }, [query, updateSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      console.log("Searching for:", query);
      
      // Normalize query: trim, lowercase, and remove extra spaces
      const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');
      
      // Split into search terms
      const terms = normalizedQuery.split(' ').filter(term => term.trim() !== '');
      
      setSearchTerms(terms);
      setIsSearching(true);
      
      // Simulate a brief loading state for better UX
      setTimeout(() => {
        onSearch(normalizedQuery);
        setIsSearching(false);
        setShowSuggestions(false);
      }, 300);
    } else {
      clearSearch();
    }
  };

  const clearSearch = () => {
    console.log("Search cleared");
    setQuery('');
    setSearchTerms([]);
    setSuggestions([]);
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
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
    <div className={`w-full transition-all duration-300 ${isSticky ? 'sticky top-20 z-30 py-2 bg-[#0f1225]/80 backdrop-blur-md shadow-md border-b border-white/10' : ''}`}>
      <motion.form 
        onSubmit={handleSubmit}
        className={`relative ${isCompact ? 'max-w-full' : 'max-w-xl mx-auto'}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
            ) : (
              <Search className={`h-4 w-4 transition-colors ${isFocused ? 'text-indigo-400' : 'text-white/60'}`} />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            className={`block w-full pl-9 pr-20 py-2 text-sm border rounded-lg transition-all duration-200 
              bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-white/50
              ${isFocused ? 'border-indigo-400/50 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30' : 'shadow-sm'}
            `}
            placeholder="Search AI agents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-16 flex items-center pr-1 text-white/50 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            className={`absolute inset-y-0 right-0 flex items-center px-3 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-r-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-xs ${isSearching ? 'opacity-80' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </motion.button>
        </div>
        
        {/* Search suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              className="absolute z-10 mt-1 w-full bg-[#1a1f36] rounded-lg shadow-xl border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-1.5 text-sm text-white/80 hover:bg-white/5 rounded cursor-pointer flex items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Sparkles className="h-3 w-3 text-indigo-400 mr-2" />
                    {suggestion}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active search terms */}
        {searchTerms.length > 0 && !isCompact && (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchTerms.map((term, index) => (
              <motion.div
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {term}
                <button
                  type="button"
                  className="ml-1 text-indigo-300/70 hover:text-indigo-300"
                  onClick={() => removeSearchTerm(term)}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.form>
    </div>
  );
};

export default SearchBar;
