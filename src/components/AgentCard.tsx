import { useState } from 'react';
import { Agent } from '../types';
import { Star, GitFork, ExternalLink, Clock, Code, Tag, Shield, Heart, ArrowUpRight } from 'lucide-react';
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
  
  // Handle loading state
  if (!agent || agent.isLoading) {
    return (
      <div className="bg-[#1a1f36]/60 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden h-full animate-pulse">
        <div className="h-32 bg-white/5"></div>
        <div className="p-4">
          <div className="h-5 bg-white/5 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-full mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-5/6 mb-3"></div>
          <div className="flex space-x-2 mb-2">
            <div className="h-5 bg-white/5 rounded w-14"></div>
            <div className="h-5 bg-white/5 rounded w-14"></div>
          </div>
          <div className="h-7 bg-white/5 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  try {
    // Safely extract all values with fallbacks for everything
    const name = agent.name || 'Unnamed Project';
    const url = agent.url || '#';
    const description = agent.description || 'No description available';
    const updated = agent.updated;
    const language = agent.language || '';
    const license = agent.license || '';
    const stars = typeof agent.stars === 'number' ? agent.stars : 0;
    const forks = typeof agent.forks === 'number' ? agent.forks : 0;
    const owner = agent.owner || 'Unknown';
    const avatar = agent.avatar || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    const tags = Array.isArray(agent.tags) ? agent.tags : [];
    
    // Safely format date if it exists
    const formattedDate = updated ? formatDistanceToNow(new Date(updated), { addSuffix: true }) : 'Unknown';
    
    // Safely truncate description
    const truncatedDescription = description.length > 100 
      ? `${description.substring(0, 100)}...` 
      : description;
    
    // Get colors safely
    const languageColor = getLanguageColor(language);
    const licenseColor = getLicenseColor(license);
    
    return (
      <motion.div 
        className="group bg-[#1a1f36]/60 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with gradient */}
        <div className="relative h-8 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20">
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            <div className="flex items-center text-yellow-400 text-xs">
              <Star className="w-3 h-3 mr-1" />
              {stars.toLocaleString()}
            </div>
            <div className="flex items-center text-white/50 text-xs">
              <GitFork className="w-3 h-3 mr-1" />
              {forks.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col h-[calc(100%-2rem)]">
          {/* Title and owner */}
          <div className="flex items-center mb-2">
            <img 
              src={avatar} 
              alt={`${owner}'s avatar`} 
              className="w-6 h-6 rounded-full border border-white/20 mr-2"
              onError={(e) => {
                e.currentTarget.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
              }}
            />
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-base font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-colors truncate"
            >
              {name}
            </a>
          </div>
          
          {/* Description */}
          <p className="text-xs text-white/70 mb-4 line-clamp-2 min-h-[2.5rem]">
            {truncatedDescription}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {language && (
              <Badge 
                variant="outline" 
                className="text-xs py-0 px-2 bg-white/5 text-white/80 border-white/10"
              >
                <Code className="w-3 h-3 mr-1" />
                {language}
              </Badge>
            )}
            
            {license && (
              <Badge 
                variant="outline" 
                className="text-xs py-0 px-2 bg-white/5 text-white/80 border-white/10"
              >
                <Shield className="w-3 h-3 mr-1" />
                {license}
              </Badge>
            )}
            
            {tags.length > 0 && tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs py-0 px-2 bg-white/5 text-white/80 border-white/10"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Integration Buttons */}
          <div className="mt-auto w-full pt-3">
            <AgentIntegrationButtons 
              repoUrl={url} 
              projectName={name} 
            />
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error('Error rendering AgentCard:', error);
    // Fallback rendering when an error occurs
    return (
      <div className="bg-[#1a1f36]/60 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden h-full p-4">
        <div className="text-center text-amber-400">
          <p className="font-medium">Could not render this project</p>
          <p className="text-xs text-amber-400/70 mt-2">Project data may be incomplete</p>
        </div>
      </div>
    );
  }
};

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
  };
  
  return colors[language] || '#8257e5'; // Default purple color
}

function getLicenseColor(license: string): string {
  const colors: Record<string, string> = {
    'MIT': '#2da44e',
    'Apache-2.0': '#e05d44',
    'GPL-3.0': '#a31f34',
    'BSD-3-Clause': '#3572A5',
    'AGPL-3.0': '#884ea0',
    'MPL-2.0': '#f39c12',
    'LGPL-3.0': '#8e44ad',
    'CC-BY-4.0': '#3498db',
    'Unlicense': '#7f8c8d',
    'ISC': '#27ae60',
  };
  
  return colors[license] || '#6c5ce7'; // Default indigo color
}

export default AgentCard;
