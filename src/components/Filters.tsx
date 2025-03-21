import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, Star, GitFork, Clock, Filter, Sparkles } from 'lucide-react';
import { SortOption } from '../types';

interface FiltersProps {
  onLanguageChange: (language: string | null) => void;
  onSortChange: (sort: SortOption) => void;
  selectedLanguage: string | null;
  selectedSort: SortOption;
  languages: string[];
}

const Filters = ({ 
  onLanguageChange, 
  onSortChange, 
  selectedLanguage, 
  selectedSort,
  languages
}: FiltersProps) => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'stars':
        return 'Most Stars';
      case 'forks':
        return 'Most Forks';
      case 'updated':
        return 'Recently Updated';
      default:
        return 'Sort';
    }
  };

  const getSortIcon = (sort: SortOption) => {
    switch (sort) {
      case 'stars':
        return <Star size={16} className="text-yellow-400" />;
      case 'forks':
        return <GitFork size={16} className="text-blue-400" />;
      case 'updated':
        return <Clock size={16} className="text-green-400" />;
      default:
        return <ArrowUpDown size={16} className="text-indigo-400" />;
    }
  };

  return (
    <div className="flex flex-row justify-between items-center gap-2 py-2 px-3 bg-[#1a1f36]/80 backdrop-blur-sm rounded-xl border border-white/10 text-white text-xs">
      <div className="flex flex-row items-center gap-3">
        <div className="flex items-center gap-1.5 text-white/80">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="font-medium">Filters</span>
        </div>
        <div ref={languageRef} className="relative">
          <button
            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            className="flex items-center justify-between min-w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-indigo-500/30 transition-colors text-xs"
          >
            <span>{selectedLanguage || 'All Languages'}</span>
            <ChevronDown size={12} className={`ml-1.5 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {languageMenuOpen && (
            <div className="absolute z-40 mt-1 min-w-40 bg-[#1a1f36] border border-white/10 rounded-xl shadow-lg shadow-black/20 overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="max-h-60 overflow-y-auto p-1">
                <button
                  onClick={() => {
                    onLanguageChange(null);
                    setLanguageMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs ${!selectedLanguage ? 'bg-indigo-500/20 font-medium text-indigo-400' : 'text-white/80'}`}
                >
                  All Languages
                </button>
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => {
                      onLanguageChange(language);
                      setLanguageMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs ${selectedLanguage === language ? 'bg-indigo-500/20 font-medium text-indigo-400' : 'text-white/80'}`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div ref={sortRef} className="relative">
        <button
          onClick={() => setSortMenuOpen(!sortMenuOpen)}
          className="flex items-center justify-between min-w-28 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-indigo-500/30 transition-colors text-xs"
        >
          <div className="flex items-center">
            {getSortIcon(selectedSort)}
            <span className="ml-1.5">{getSortLabel(selectedSort)}</span>
          </div>
          <ChevronDown size={12} className={`ml-1.5 transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {sortMenuOpen && (
          <div className="absolute right-0 z-40 mt-1 min-w-40 bg-[#1a1f36] border border-white/10 rounded-xl shadow-lg shadow-black/20 overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-1">
              <button
                onClick={() => {
                  onSortChange('stars');
                  setSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center ${selectedSort === 'stars' ? 'bg-indigo-500/20 font-medium text-indigo-400' : 'text-white/80'}`}
              >
                <Star size={14} className="mr-2 text-yellow-400" />
                Most Stars
              </button>
              <button
                onClick={() => {
                  onSortChange('forks');
                  setSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center ${selectedSort === 'forks' ? 'bg-indigo-500/20 font-medium text-indigo-400' : 'text-white/80'}`}
              >
                <GitFork size={14} className="mr-2 text-blue-400" />
                Most Forks
              </button>
              <button
                onClick={() => {
                  onSortChange('updated');
                  setSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center ${selectedSort === 'updated' ? 'bg-indigo-500/20 font-medium text-indigo-400' : 'text-white/80'}`}
              >
                <Clock size={14} className="mr-2 text-green-400" />
                Recently Updated
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
