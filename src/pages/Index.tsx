import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DirectoryGrid from '../components/DirectoryGrid';
import { GitHubService } from '../services/GitHubService';
import { Layers, Heart, Github, Sparkles } from 'lucide-react';
import AddProjectModal from '../components/AddProjectModal';
import BulkImportModal from '../components/BulkImportModal';
import { useToast } from '../components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [totalProjects, setTotalProjects] = useState(100); // Default value
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-render of DirectoryGrid

  useEffect(() => {
    const lastRefresh = localStorage.getItem('lastAgentRefresh');
    const now = new Date();
    
    if (!lastRefresh || (now.getTime() - new Date(lastRefresh).getTime() > 24 * 60 * 60 * 1000)) {
      refreshData();
    } else {
      updateTotalProjects();
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      console.log('Refreshing agent data...');
      const refreshedData = await GitHubService.refreshAgentData();
      console.log(`Refresh complete: found ${refreshedData.length} projects`);
      localStorage.setItem('lastAgentRefresh', new Date().toISOString());
      setTotalProjects(refreshedData.length);
      setRefreshKey(prev => prev + 1); // Force re-render of directory grid
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again later.",
        variant: "destructive"
      });
      // Fallback to just counting existing projects
      updateTotalProjects();
    }
  }, [toast]);

  const updateTotalProjects = useCallback(async () => {
    try {
      const projects = await GitHubService.getAllProjects();
      setTotalProjects(projects.length);
    } catch (error) {
      console.error("Error updating total projects:", error);
      toast({
        title: "Error Loading Projects",
        description: "There was an error loading projects. Default data will be shown.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const directorySection = document.getElementById('directory');
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddProject = () => {
    setIsAddProjectModalOpen(true);
  };

  const handleBulkImport = () => {
    setIsBulkImportModalOpen(true);
  };

  const handleProjectsAdded = async (count: number) => {
    try {
      // Refresh the directory data
      await refreshData();
      
      toast({
        title: "Success",
        description: `${count} project${count === 1 ? '' : 's'} added to the directory.`,
      });
    } catch (error) {
      console.error("Error refreshing data after adding projects:", error);
      toast({
        title: "Warning",
        description: "Projects were added but the directory may need to be refreshed manually.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="bg-[#0e1129] min-h-screen">
        <Hero onSearch={handleSearch} onAddProject={handleAddProject} totalProjects={totalProjects} />
        
        <div id="directory" className="max-w-7xl mx-auto px-4 pt-2 pb-8">
          <DirectoryGrid key={refreshKey} initialSearchQuery={searchQuery} />
        </div>
        
        <section id="about-section" className="py-16 bg-gradient-to-b from-[#0e1129] to-[#1e2344] text-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              About Agent MCP Directory
            </h2>
            
            <div className="bg-[#1a1f36]/50 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-white/10">
              <p className="text-white/80 mb-6">
                Agent MCP Directory is a project to enable access to open source AI agent projects. 
                It's an initiative by techies for techies to support them in receiving unfiltered 
                information about the latest developments in AI agent technology and MCP orchestration.
              </p>
              
              <p className="text-white/80 mb-6">
                Our goal is to catalog and maintain the most comprehensive collection of open-source 
                AI agent projects and tools. We automatically scan GitHub, Google, and X (formerly Twitter) 
                for new projects that are tagged with "AI Agent", "AI Agents", or "MCP orchestration", 
                ensuring our directory stays up to date with the latest innovations.
              </p>
              
              <p className="text-white/80 mb-6">
                The directory updates daily to ensure you always have access to the most current 
                information. We particularly highlight projects that are gaining traction, newly 
                released with significant potential, or showing rapid growth.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-indigo-300 flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                Our Mission
              </h3>
              <p className="text-white/80 mb-6">
                To provide the most comprehensive, up-to-date, and accessible directory of open-source 
                AI agent projects, enabling developers, researchers, and enthusiasts to discover, 
                contribute to, and build upon the collective knowledge of the community.
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-indigo-300 flex items-center gap-2">
                <Github className="h-4 w-4 text-white" />
                Contact Us
              </h3>
              <p className="text-white/80 mb-6">
                Have questions or want to share information about an AI agent project? 
                Reach out to us on <a href="https://github.com/AgentMCP/ai-agent-directory" className="text-indigo-400 hover:underline">GitHub</a>.
              </p>
              <div className="flex justify-center mt-8">
                <a 
                  href="https://www.paypal.com/donate?token=WyyhlBRzymlKv6XC8r4DYaLDx52x2gAHZGnnkNhyyKneaZ3ls9k4Ot53_JDohCWmmTW6iHFPz9Qu_ySK" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <button 
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-sm text-sm border border-indigo-400"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.876.78 1.9.78 3.03 0 3.02-2.53 5.788-6.556 5.788a7.43 7.43 0 0 1-1.087-.08c-.31.818-1.079 1.392-1.98 1.392h-.57c-.383 0-.686-.317-.588-.688l.455-2.797c.038-.23.235-.402.47-.402h.618c.386 0 .734-.157.99-.41.15-.148.258-.332.328-.53.07-.2.09-.413.07-.625a7.11 7.11 0 0 1-.063-.918c0-3.02 2.53-5.788 6.557-5.788.89 0 1.73.183 2.496.51.285-.51.81-.853 1.418-.853h.57c.384 0 .687.317.589.688l-.455 2.796c-.038.23-.235.402-.47.402h-.618c-.653 0-1.218.44-1.404 1.07a5.26 5.26 0 0 1-.55 1.415zM9.482 5.108c-.381 0-.685-.317-.588-.688l.456-2.797c.038-.23.235-.402.47-.402h.617c.872 0 1.56.714 1.485 1.582-.032.368-.223.692-.504.9-.28.21-.624.317-.97.317H9.481zm-4.5 13.565c.032-.368.223-.692.504-.9.282-.21.624-.317.97-.317h.967c.383 0 .686.317.588.688l-.455 2.796c-.038.23-.235.402-.47.402h-.618c-.872 0-1.56-.714-1.485-1.582z"/>
                    </svg>
                    Donate
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm"> 2024 Agent MCP Directory. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="https://github.com/AgentMCP/ai-agent-directory" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <AddProjectModal 
        isOpen={isAddProjectModalOpen} 
        onClose={() => setIsAddProjectModalOpen(false)}
        onProjectAdded={handleProjectsAdded}
      />
      
      <BulkImportModal 
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onProjectsAdded={handleProjectsAdded}
      />
    </div>
  );
};

export default Index;
