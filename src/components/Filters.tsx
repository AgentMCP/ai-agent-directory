import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, Star, GitFork, Clock, Filter } from 'lucide-react';
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
        return <Star size={16} />;
      case 'forks':
        return <GitFork size={16} />;
      case 'updated':
        return <Clock size={16} />;
      default:
        return <ArrowUpDown size={16} />;
    }
  };

  return (
    <div className="flex flex-row justify-between items-center gap-2 py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 backdrop-blur-sm text-sm">
      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center gap-1 text-gray-500">
          <Filter size={14} />
          <span className="font-medium">Filters:</span>
        </div>
        <div ref={languageRef} className="relative">
          <button
            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            className="flex items-center justify-between min-w-24 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary hover:text-primary transition-colors text-xs"
          >
            <span>{selectedLanguage || 'All Languages'}</span>
            <ChevronDown size={12} className={`ml-1 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {languageMenuOpen && (
            <div className="absolute z-40 mt-1 min-w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="max-h-60 overflow-y-auto p-1">
                <button
                  onClick={() => {
                    onLanguageChange(null);
                    setLanguageMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors text-xs ${!selectedLanguage ? 'bg-gray-100 font-medium' : ''}`}
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
                    className={`w-full text-left px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors text-xs ${selectedLanguage === language ? 'bg-gray-100 font-medium' : ''}`}
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
          className="flex items-center justify-between min-w-32 px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary hover:text-primary transition-colors text-xs"
        >
          <span className="flex items-center">
            {getSortIcon(selectedSort)}
            <span className="ml-1">{getSortLabel(selectedSort)}</span>
          </span>
          <ChevronDown size={12} className={`ml-1 transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {sortMenuOpen && (
          <div className="absolute right-0 z-40 mt-1 min-w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-1">
              <button
                onClick={() => {
                  onSortChange('stars');
                  setSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center text-xs ${selectedSort === 'stars' ? 'bg-gray-100 font-medium' : ''}`}
              >
                <Star size={12} className="mr-1" /> Most Stars
              </button>
              <button
                onClick={() => {
                  onSortChange('forks');
                  setSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center text-xs ${selectedSort === 'forks' ? 'bg-gray-100 font-medium' : ''}`}
              >
                <GitFork size={12} className="mr-1" /> Most Forks
              </button>
              <button
                onClick={() => {
                  onSortChange('updated');
                  setSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center text-xs ${selectedSort === 'updated' ? 'bg-gray-100 font-medium' : ''}`}
              >
                <Clock size={12} className="mr-1" /> Recently Updated
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
