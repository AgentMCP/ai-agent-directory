import { useRef, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import { useInView } from '../utils/animations';
import { GitHubService } from '../services/GitHubService';
import { Button } from './ui/button';
import { ArrowRight, Plus } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  onAddProject?: () => void;
}

const Hero = ({ onSearch, onAddProject }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, '-100px');
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isFramerLoading, setIsFramerLoading] = useState(false);
  const [framerLoadingProgress, setFramerLoadingProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    setLastUpdated(GitHubService.getLastUpdatedTimestamp());
  }, []);

  const handleRefresh = async () => {
    const result = await GitHubService.refreshAgentData();
    setLastUpdated(result.timestamp);
  };

  const handleFramerClick = () => {
    setIsFramerLoading(true);
    setFramerLoadingProgress(0);
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setFramerLoadingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10) + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Navigate to Framer website after loading completes
          setTimeout(() => {
            window.open('https://www.framer.com', '_blank');
            setIsFramerLoading(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[15vh] flex flex-col items-center justify-center px-4 pt-4 pb-1 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      <div 
        className={`max-w-4xl mx-auto text-center transition-opacity duration-1000 ease-out transform ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="inline-block mb-2 bg-secondary text-primary text-xs px-3 py-1 rounded-full font-medium">
          <span>250+ AI Agent & MCP Projects</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-2 tracking-tight leading-tight text-balance">
          AI Agent & MCP <span className="gradient-text">Directory</span>
        </h1>
        
        <p className="text-sm md:text-base text-gray-600 mb-4 max-w-2xl mx-auto">
          Your go-to resource for discovering cutting-edge AI agent projects and tools for building autonomous systems.
        </p>
        
        <div className="max-w-xl mx-auto mt-2 mb-3">
          <SearchBar 
            defaultValue="" 
            onSearch={onSearch} 
            lastUpdated={GitHubService.formatLastUpdated(lastUpdated)}
            isCompact={true}
          />
          
          <div className="mt-2 flex flex-wrap justify-center gap-1 text-xs text-gray-600">
            <span className="text-gray-500">Popular:</span>
            <button 
              type="button"
              onClick={() => onSearch('autonomous')}
              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              Autonomous
            </button>
            <button 
              type="button"
              onClick={() => onSearch('LangChain')}
              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              LangChain
            </button>
            <button 
              type="button"
              onClick={() => onSearch('GPT')}
              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              GPT
            </button>
            <button 
              type="button"
              onClick={() => onSearch('Dify')}
              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              Dify
            </button>
            <button 
              type="button"
              onClick={() => onSearch('MCP')}
              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              MCP
            </button>
          </div>
          
          {/* Framer Button */}
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={handleFramerClick} 
              disabled={isFramerLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4" />
              {isFramerLoading ? 'Loading Framer...' : 'Framer'}
              {isFramerLoading && (
                <div className="ml-2 w-20 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${framerLoadingProgress}%` }}
                  ></div>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div 
        className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent transition-opacity duration-1000 ${
          isInView ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>
    </div>
  );
};

export default Hero;
