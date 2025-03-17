import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DirectoryGrid from '../components/DirectoryGrid';
import { GitHubService } from '../services/GitHubService';
import { Layers, Heart, Github } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const lastRefresh = localStorage.getItem('lastAgentRefresh');
    const now = new Date();
    
    if (!lastRefresh || (now.getTime() - new Date(lastRefresh).getTime() > 24 * 60 * 60 * 1000)) {
      GitHubService.refreshAgentData().then((refreshedData) => {
        localStorage.setItem('lastAgentRefresh', now.toISOString());
      });
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const directorySection = document.getElementById('directory');
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero onSearch={handleSearch} />
        
        <div id="directory" className="bg-white py-0 min-h-screen">
          <DirectoryGrid initialSearchQuery={searchQuery} />
        </div>
        
        <section id="about-section" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Agent MCP Directory</h2>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-700 mb-6">
                Agent MCP Directory is a project to enable access to open source AI agent projects. 
                It's an initiative by techies for techies to support them in receiving unfiltered 
                information about the latest developments in AI agent technology and MCP orchestration.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our goal is to catalog and maintain the most comprehensive collection of open-source 
                AI agent projects and tools. We automatically scan GitHub, Google, and X (formerly Twitter) 
                for new projects that are tagged with "AI Agent", "AI Agents", or "MCP orchestration", 
                ensuring our directory stays up to date with the latest innovations.
              </p>
              
              <p className="text-gray-700 mb-6">
                The directory updates daily to ensure you always have access to the most current 
                information. We particularly highlight projects that are gaining traction, newly 
                released with significant potential, or showing rapid growth.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-700 mb-6">
                To provide the most comprehensive, up-to-date, and accessible directory of open-source 
                AI agent projects, enabling developers, researchers, and enthusiasts to discover, 
                contribute to, and build upon the collective knowledge of the community.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <p className="text-gray-700 mb-6">
                Have questions or want to share information about an AI agent project? 
                Reach out to us via <a href="https://github.com/AgentMCP/ai-agent-directory/issues" className="text-blue-600 hover:underline">GitHub Issues</a>.
              </p>

              <h3 className="text-lg font-semibold mb-3">Support Our Work</h3>
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  If you appreciate our work and want to help keep it going, consider making a small donation. 
                  Your support covers essential costs like server upkeep, web hosting, and more, ensuring we can continue providing value. 
                  Every contribution, no matter the size, makes a difference—thank you!
                </p>
                <form action="https://www.paypal.com/donate" method="post" target="_top" className="mt-3">
                  <input type="hidden" name="hosted_button_id" value="UX72DF8RHEZEG" />
                  <input 
                    type="image" 
                    src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" 
                    name="submit" 
                    title="PayPal - The safer, easier way to pay online!" 
                    alt="Donate with PayPal button" 
                    style={{ border: 0 }}
                  />
                  <img 
                    alt="" 
                    src="https://www.paypal.com/en_NL/i/scr/pixel.gif" 
                    width="1" 
                    height="1" 
                    style={{ border: 0 }}
                  />
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 mr-2">
                  <div className="relative">
                    <Layers className="w-6 h-6 text-blue-400 absolute" style={{ top: -2, left: -2 }} />
                    <Heart className="w-5 h-5 text-red-400 absolute" style={{ top: 0, left: 0 }} />
                  </div>
                </div>
                <div className="text-xl font-bold font-display tracking-tight">
                  <span className="text-blue-400">Agent</span>
                  <span className="text-white"> MCP</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                The definitive resource for discovering and exploring AI agents and open-source projects.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Autonomous Agents</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">LLM Frameworks</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">AI Tools</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">MCP Projects</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/AgentMCP/ai-agent-directory" className="text-gray-300 hover:text-white transition-colors">GitHub Repository</a></li>
                <li><a href="https://github.com/AgentMCP/ai-agent-directory/issues" className="text-gray-300 hover:text-white transition-colors">Report an Issue</a></li>
                <li><a href="https://github.com/AgentMCP/ai-agent-directory/blob/main/CONTRIBUTING.md" className="text-gray-300 hover:text-white transition-colors">Contribute</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://github.com/AgentMCP" className="text-gray-300 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>

          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Agent MCP Directory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
