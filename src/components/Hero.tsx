import { useRef, useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import { useInView } from '../utils/animations';
import { GitHubService } from '../services/GitHubService';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  onAddProject?: () => void;
}

const Hero = ({ onSearch, onAddProject }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, '-100px');
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setIsVisible(true);
    setLastUpdated(GitHubService.getLastUpdatedTimestamp());
  }, []);

  const handleRefresh = async () => {
    const result = await GitHubService.refreshAgentData();
    setLastUpdated(result.timestamp);
  };

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[25vh] flex flex-col items-center justify-center px-4 pt-6 pb-4 overflow-hidden"
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
        <div className="inline-block mb-4 bg-secondary text-primary text-sm px-4 py-1.5 rounded-full font-medium">
          <span>250+ AI Agent & MCP Projects</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 tracking-tight leading-tight text-balance">
          AI Agent & MCP <span className="gradient-text">Directory</span>
        </h1>
        
        <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Your go-to resource for discovering cutting-edge AI agent projects and tools for building autonomous systems.
        </p>
        
        <div className="max-w-xl mx-auto mt-4 mb-6">
          <SearchBar 
            defaultValue="" 
            onSearch={onSearch} 
            lastUpdated={GitHubService.formatLastUpdated(lastUpdated)}
            isCompact={true}
          />
          
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
            <span className="text-gray-500">Popular:</span>
            <button 
              type="button"
              onClick={() => onSearch('autonomous')}
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              Autonomous
            </button>
            <button 
              type="button"
              onClick={() => onSearch('LangChain')}
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              LangChain
            </button>
            <button 
              type="button"
              onClick={() => onSearch('GPT')}
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              GPT
            </button>
            <button 
              type="button"
              onClick={() => onSearch('Dify')}
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              Dify
            </button>
            <button 
              type="button"
              onClick={() => onSearch('MCP')}
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-secondary hover:text-primary transition-colors"
            >
              MCP
            </button>
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
