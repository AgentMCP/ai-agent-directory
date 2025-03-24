import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { Progress } from './ui/progress';
import { PlusIcon } from 'lucide-react';

interface AgentIntegrationButtonsProps {
  repoUrl: string;
  projectName: string;
}

const AgentIntegrationButtons = ({ repoUrl, projectName }: AgentIntegrationButtonsProps) => {
  const [integrationState, setIntegrationState] = useState<{
    platform: string | null;
    progress: number;
    isLoading: boolean;
    statusMessage: string;
  }>({
    platform: null,
    progress: 0,
    isLoading: false,
    statusMessage: '',
  });

  const handleIntegration = async (platform: string) => {
    // Reset state and start integration
    setIntegrationState({
      platform,
      progress: 0,
      isLoading: true,
      statusMessage: 'Initializing integration...',
    });
    
    // Simulate steps of integration process with real progress updates
    console.log(`Integrating ${projectName} with ${platform} from ${repoUrl}`);
    
    toast({
      title: `Integration with ${platform}`,
      description: `Started importing ${projectName} to ${platform}`,
    });
    
    // Simulate code analysis
    await simulateStep('Analyzing repository structure...', 10);
    
    // Simulate downloading
    await simulateStep('Downloading repository contents...', 30);
    
    // Simulate parsing
    await simulateStep('Parsing code and dependencies...', 50);
    
    // Simulate configuring
    await simulateStep('Configuring for ' + platform + '...', 70);
    
    // Simulate final import
    await simulateStep('Finalizing import...', 90);
    
    // Complete integration
    setIntegrationState(prev => ({
      ...prev,
      progress: 100,
      statusMessage: 'Integration complete!',
    }));
    
    toast({
      title: "Integration complete",
      description: `${projectName} has been successfully imported to ${platform}`,
    });
    
    // Check for local installation first, then redirect to website if none found
    const checkLocalInstallAndOpenWebsite = (protocol: string, websiteUrl: string) => {
      // Try to open with custom protocol
      const protocolCheck = window.open(protocol, '_blank');
      
      // Set a timeout to check if the protocol handler worked
      setTimeout(() => {
        // If protocol handler didn't work or was blocked, open the website
        if (!protocolCheck || protocolCheck.closed || protocolCheck.location.href === 'about:blank') {
          window.open(websiteUrl, '_blank');
        }
      }, 1000); // Wait 1 second to see if the protocol handler worked
    };
    
    // Attempt local installation first, fall back to website
    if (platform === 'Framer') {
      window.open('https://www.framer.com', '_blank');
    } else if (platform === 'Cursor AI') {
      checkLocalInstallAndOpenWebsite('cursor://open', 'https://cursor.sh');
    } else if (platform === 'Windsurf AI') {
      checkLocalInstallAndOpenWebsite('windsurf://open', 'https://windsurf.io');
    }
    
    // Reset after showing completion
    setTimeout(() => {
      setIntegrationState({
        platform: null,
        progress: 0,
        isLoading: false,
        statusMessage: '',
      });
    }, 2000);
  };

  const simulateStep = (message: string, progress: number): Promise<void> => {
    return new Promise(resolve => {
      setIntegrationState(prev => ({
        ...prev,
        progress,
        statusMessage: message,
      }));
      
      // Random delay between 500ms and 1500ms to simulate processing
      setTimeout(() => {
        resolve();
      }, 500 + Math.random() * 1000);
    });
  };

  return (
    <div className="w-full">
      {integrationState.isLoading ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/70">
            <span>{integrationState.statusMessage}</span>
            <span>{integrationState.progress}%</span>
          </div>
          <Progress 
            value={integrationState.progress} 
            className="h-1.5 bg-white/10" 
            indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" 
          />
        </div>
      ) : (
        <div className="flex justify-center items-center gap-5 w-full">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-24 px-3 text-xs py-0.5 h-6 rounded-full border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:border-white/80 transition-all flex items-center justify-center gap-1"
            onClick={() => handleIntegration('Cursor AI')}
          >
            <PlusIcon className="w-3 h-3" /> Cursor
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-24 px-3 text-xs py-0.5 h-6 rounded-full border-2 border-white/60 bg-transparent text-white hover:bg-white/10 hover:border-white/80 transition-all flex items-center justify-center gap-1"
            onClick={() => handleIntegration('Windsurf AI')}
          >
            <PlusIcon className="w-3 h-3" /> Windsurf
          </Button>
        </div>
      )}
    </div>
  );
};

export default AgentIntegrationButtons;
