import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, Sparkles, Github, Zap, Search } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const headlines = [
    "Discover the Best AI Agents",
    "Find Open Source AI Tools",
    "Explore AI Agent Repositories",
    "Build with AI Agents"
  ];
  
  const popularSearches = [
    "autonomous agent",
    "llm",
    "mcp",
    "ai assistant",
    "python agent",
    "typescript agent"
  ];
  
  useEffect(() => {
    // Start the animation after component mount
    setIsVisible(true);
    
    // Rotate headlines every 4 seconds
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % headlines.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePopularSearch = (term: string) => {
    onSearch(term);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 pt-20 pb-16 md:pt-32 md:pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-40 -left-20 h-60 w-60 rounded-full bg-secondary/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
      </div>
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-background px-3 py-1 text-sm font-medium text-primary shadow-sm"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            <span>AI Agent Directory</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[120px] md:h-[150px] mb-4 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
              >
                {headlines[activeIndex]}
              </motion.h1>
            </AnimatePresence>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8 text-lg text-muted-foreground md:text-xl"
          >
            Explore a curated collection of AI agents, tools, and frameworks to supercharge your projects.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mb-8 max-w-xl"
          >
            <SearchBar onSearch={onSearch} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-10"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Search className="mr-1 h-3.5 w-3.5" />
                Popular:
              </span>
              {popularSearches.map((term, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary/50 transition-colors border-primary/20"
                  onClick={() => handlePopularSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="group"
              onClick={() => {
                const directorySection = document.getElementById('directory');
                if (directorySection) {
                  directorySection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Explore Directory
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open('https://github.com/AgentMCP/ai-agent-directory', '_blank')}
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 80"
          className="w-full h-auto fill-background"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,53.3C1120,53,1280,43,1360,37.3L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
