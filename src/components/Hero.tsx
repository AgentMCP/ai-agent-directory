import { useState } from 'react';
import { Search, Star, Github, ArrowRight, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import SearchBar from './SearchBar';

interface HeroProps {
  onSearch: (query: string) => void;
  onAddProject: () => void;
  totalProjects: number;
}

const Hero = ({ onSearch, onAddProject, totalProjects }: HeroProps) => {
  return (
    <div className="relative py-6 px-4 bg-gradient-to-b from-[#0e1129] to-[#1e2344] text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left side: Hero content */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-3">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium mb-1"
            >
              <span className="text-indigo-300">✨ The #1 Open Source AI Agents and MCP Server Directory</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-2xl font-bold text-white tracking-tight leading-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Open Source AI Agents and MCP Servers</span> for your vibe coding project
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm text-white/70 max-w-lg"
            >
              An open-source project helping developers access and integrate AI agents and MCP servers into their workflow.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-wrap justify-center md:justify-start gap-2 mt-3"
            >
              <Button 
                onClick={onAddProject} 
                size="sm"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md"
              >
                Add Project <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                onClick={() => window.open('https://github.com/AgentMCP/ai-agent-directory', '_blank')}
              >
                <Github className="mr-1 h-3.5 w-3.5" /> Star on GitHub
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center justify-center md:justify-start gap-4 text-xs text-white/60 mt-2"
            >
              <div className="flex items-center">
                <Database className="h-2 w-2 mr-0.5 text-indigo-400" />
                <span className="text-[10px] font-medium border-b border-indigo-400/30 pb-0.5">{totalProjects}+ Open Source AI Agent Projects</span>
              </div>
            </motion.div>
          </div>
          
          {/* Right side: Search and Directory Preview */}
          <div className="w-full md:w-1/2 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <SearchBar onSearch={onSearch} isCompact={true} />
            </motion.div>
            
            {/* Directory Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-[#1a1f36]/50 backdrop-blur-sm rounded-lg border border-white/10 p-3 shadow-xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Star className="h-3 w-3 mr-1 text-yellow-400" />
                  Popular AI Agents
                </h3>
                <Button 
                  variant="link" 
                  className="text-indigo-400 hover:text-indigo-300 p-0 h-auto text-xs"
                  onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Preview Cards - Just showing 4 examples */}
                {[
                  { name: 'Auto-GPT', stars: '153k', language: 'Python' },
                  { name: 'BabyAGI', stars: '17.7k', language: 'Python' },
                  { name: 'AgentGPT', stars: '28.1k', language: 'TypeScript' },
                  { name: 'LangChain', stars: '77k', language: 'Python' }
                ].map((agent, index) => (
                  <div key={index} className="bg-[#0e1129] rounded-md p-2 border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer">
                    <h4 className="font-medium text-white text-xs truncate">{agent.name}</h4>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-indigo-400 text-[10px]">{agent.language}</span>
                      <div className="flex items-center text-[10px] text-yellow-400">
                        <Star className="h-2 w-2 mr-0.5" />
                        {agent.stars}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
