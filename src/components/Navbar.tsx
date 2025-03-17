import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import LoginButton from './LoginButton';
import { useAuth } from '../contexts/AuthContext';
import BulkImportModal from './BulkImportModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Check if user is admin (has specific email)
  const isAdmin = currentUser?.email === 'kasem@ie-14.com';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
              <span className="gradient-text">Agent</span>
              <span>MCP</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex items-center space-x-6">
            <Link to="/" className="text-gray-800 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-800 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About
            </Link>
            <Link to="/resources" className="text-gray-800 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Resources
            </Link>
            <a 
              href="https://github.com/AgentMCP/ai-agent-directory" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-800 hover:text-primary flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            
            {isAdmin && currentUser && (
              <BulkImportModal />
            )}
            
            <LoginButton />
          </div>
          
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 py-2 animate-fade-in">
          <div className="px-4 space-y-1">
            <Link
              to="/"
              className="text-gray-800 hover:bg-secondary hover:text-primary block px-3 py-2 rounded-xl text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-800 hover:bg-secondary hover:text-primary block px-3 py-2 rounded-xl text-base font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/resources"
              className="text-gray-800 hover:bg-secondary hover:text-primary block px-3 py-2 rounded-xl text-base font-medium transition-colors"
            >
              Resources
            </Link>
            <a
              href="https://github.com/AgentMCP/ai-agent-directory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:bg-secondary hover:text-primary flex items-center gap-1 px-3 py-2 rounded-xl text-base font-medium transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            
            {isAdmin && currentUser && (
              <div className="px-3 py-2">
                <BulkImportModal />
              </div>
            )}
            
            <div className="px-3 py-2">
              <LoginButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
