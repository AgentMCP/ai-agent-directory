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
    
    // Open Framer website if the platform is Framer
    if (platform === 'Framer') {
      window.open('https://www.framer.com', '_blank');
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
          <div className="flex justify-between text-xs text-gray-600">
            <span>{integrationState.statusMessage}</span>
            <span>{integrationState.progress}%</span>
          </div>
          <Progress value={integrationState.progress} className="h-2 bg-gray-100" indicatorClassName="bg-primary" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs py-1 h-8 rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            onClick={() => handleIntegration('Cursor AI')}
          >
            <PlusIcon className="w-3 h-3" /> Cursor AI
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs py-1 h-8 rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            onClick={() => handleIntegration('Windsurf AI')}
          >
            <PlusIcon className="w-3 h-3" /> Windsurf AI
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs py-1 h-8 rounded-full border-gray-200 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            onClick={() => handleIntegration('Framer')}
          >
            <PlusIcon className="w-3 h-3" /> Framer
          </Button>
        </div>
      )}
    </div>
  );
};

export default AgentIntegrationButtons;
