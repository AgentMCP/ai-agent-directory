import { useState } from 'react';
import { Agent } from '../types';
import { Star, GitFork, ExternalLink, Clock, Code, Tag, Shield, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import AgentIntegrationButtons from './AgentIntegrationButtons';
import { motion } from 'framer-motion';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard = ({ agent }: AgentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (agent.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full animate-pulse">
        <div className="h-40 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="flex space-x-2 mb-3">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const formattedDate = agent.updated 
    ? formatDistanceToNow(new Date(agent.updated), { addSuffix: true }) 
    : 'Unknown';
  
  const truncatedDescription = agent.description.length > 120 
    ? `${agent.description.substring(0, 120)}...` 
    : agent.description;
  
  const languageColor = getLanguageColor(agent.language);
  
  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:border-primary/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Gradient overlay for the header */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 opacity-70"></div>
        
        {/* Repository owner avatar */}
        <div className="flex items-center p-4 relative">
          <div className="flex-shrink-0 mr-3">
            <img 
              src={agent.avatar || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
              alt={`${agent.owner}'s avatar`} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {agent.owner}
            </p>
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 pt-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary transition-colors">
          <a href={agent.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start">
            <span className="truncate">{agent.name}</span>
            <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0 opacity-70" />
          </a>
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 h-[4.5rem]">
          {truncatedDescription}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.topics.slice(0, 3).map((topic, index) => (
            <Badge 
              key={`${topic}-${index}`} 
              variant="secondary" 
              className="text-xs py-0 px-2 bg-secondary/30 text-primary hover:bg-secondary"
            >
              <Tag className="w-3 h-3 mr-1" />
              {topic}
            </Badge>
          ))}
          {agent.topics.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs py-0 px-2 text-gray-500 border-gray-200"
            >
              +{agent.topics.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{agent.stars.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center text-blue-500">
              <GitFork className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{agent.forks.toLocaleString()}</span>
            </div>
          </div>
          
          {agent.language && (
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: languageColor }}
              ></span>
              <span className="text-xs text-gray-600">{agent.language}</span>
            </div>
          )}
        </div>
        
        <AgentIntegrationButtons repoUrl={agent.url} projectName={agent.name} />
        
        <div className={`mt-3 pt-3 border-t border-gray-100 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <a 
            href={agent.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full text-xs text-gray-600 hover:text-primary transition-colors"
          >
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <Heart className="w-3 h-3 mr-1" />
              View Project
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
  };
  
  return colors[language] || '#6e7781';
};

export default AgentCard;
