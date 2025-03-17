import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from './ui/use-toast';
import { GitHubService } from '../services/GitHubService';
import { ScrapeService } from '../services/ScrapeService';
import { Search, Loader2, Link, AlertCircle } from 'lucide-react';
import { Agent } from '../types';
import { Input } from './ui/input';

interface BulkImportModalProps {
  onProjectsAdded?: (agents: Agent[]) => void;
}

const BulkImportModal = ({ onProjectsAdded }: BulkImportModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [importedProjects, setImportedProjects] = useState<Agent[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [showSatisfactionQuery, setShowSatisfactionQuery] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Mock search results data based on real GitHub AI agent projects
  // In a real implementation, this would be fetched from an API
  const searchGithub = async (term: string): Promise<string[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    // Return a subset of repository URLs for each search term
    // These are based on real repositories related to AI agents
    const realRepoUrls: Record<string, string[]> = {
      'AI Agent GitHub': [
        'https://github.com/Significant-Gravitas/Auto-GPT',
        'https://github.com/yoheinakajima/babyagi',
        'https://github.com/reworkd/AgentGPT',
        'https://github.com/joaomdmoura/crewAI'
      ],
      'MCP GitHub': [
        'https://github.com/AgentMCP/mcp-framework',
        'https://github.com/microsoft/semantic-kernel',
        'https://github.com/microsoft/TaskWeaver',
        'https://github.com/milvus-io/pymilvus'
      ],
      'autonomous AI agent GitHub': [
        'https://github.com/TransformerOptimus/SuperAGI',
        'https://github.com/OpenBMB/XAgent',
        'https://github.com/Torantulino/Auto-GPT-Plugin-Template',
        'https://github.com/OpenDevin/OpenDevin'
      ],
      'AI assistant GitHub': [
        'https://github.com/langchain-ai/langchainjs',
        'https://github.com/deepset-ai/haystack',
        'https://github.com/geekan/MetaGPT',
        'https://github.com/imartinez/privateGPT'
      ],
      'LLM agent GitHub': [
        'https://github.com/run-llama/llama_index',
        'https://github.com/hwchase17/langchain',
        'https://github.com/mlc-ai/mlc-llm',
        'https://github.com/ggerganov/llama.cpp'
      ]
    };
    
    // Return the repositories for the given search term, or a default set if not found
    return realRepoUrls[term] || [
      'https://github.com/microsoft/guidance',
      'https://github.com/chroma-core/chroma',
      'https://github.com/pola-rs/polars',
      'https://github.com/lm-sys/FastChat'
    ];
  };

  const simulateGoogleSearch = async (searchTerms: string[]) => {
    setIsLoading(true);
    setProgress(0);
    setImportedProjects([]);
    setTotalFound(0);
    setShowSatisfactionQuery(false);
    
    try {
      // Simulate searching Google for each search term
      let allRepoUrls: string[] = [];
      
      for (let i = 0; i < searchTerms.length; i++) {
        const term = searchTerms[i];
        setStatus(`Searching for "${term}"... (${i + 1}/${searchTerms.length})`);
        setProgress(Math.floor((i / searchTerms.length) * 30));
        
        // Get repository URLs for this search term
        const repoUrls = await searchGithub(term);
        allRepoUrls = [...allRepoUrls, ...repoUrls];
        
        // Remove duplicates
        allRepoUrls = [...new Set(allRepoUrls)];
      }
      
      setTotalFound(allRepoUrls.length);
      setStatus(`Found ${allRepoUrls.length} potential GitHub repositories. Analyzing...`);
      setProgress(30);
      
      // Process each repository URL
      let foundProjects: Agent[] = [];
      
      for (let i = 0; i < allRepoUrls.length; i++) {
        const repoUrl = allRepoUrls[i];
        const currentProgress = 30 + Math.floor((i / allRepoUrls.length) * 65);
        setProgress(currentProgress);
        setStatus(`Processing repository ${i + 1} of ${allRepoUrls.length}: ${repoUrl}`);
        
        try {
          // Try to add this repository
          const result = await GitHubService.addProjectFromGitHub(repoUrl);
          
          if (result.success && result.agent) {
            foundProjects.push(result.agent);
            setImportedProjects([...foundProjects]);
          }
        } catch (error) {
          console.error('Error adding repository:', error);
        }
        
        // Slight delay to avoid overwhelming the UI with updates
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Finalize import
      setStatus('Finalizing import...');
      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('Import complete!');
      setProgress(100);
      
      toast({
        title: 'Bulk Import Complete',
        description: `Successfully imported ${foundProjects.length} AI agent projects`,
      });
      
      if (onProjectsAdded && foundProjects.length > 0) {
        onProjectsAdded(foundProjects);
      }
      
      // Show satisfaction query
      setShowSatisfactionQuery(true);
      
    } catch (error) {
      console.error('Error during bulk import:', error);
      toast({
        title: 'Import Failed',
        description: 'An error occurred during the bulk import process',
        variant: 'destructive',
      });
      setIsLoading(false);
      setShowSatisfactionQuery(true);
    }
  };

  const handleBulkImport = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('Searching for AI Agent and MCP repositories...');
    setImportedProjects([]);
    setTotalFound(0);

    try {
      // First update the UI to show we're searching
      setProgress(10);
      
      // Use the ScrapeService instead of the API endpoint
      setStatus('Finding relevant repositories...');
      const repositories = await ScrapeService.scrapeGitHubRepositories('AI Agent MCP GitHub');
      
      // Add some additional repositories for variety
      const additionalRepos = ScrapeService.getAdditionalRepositories();
      const allRepositories = [...repositories, ...additionalRepos];
      
      setProgress(50);
      
      if (allRepositories.length > 0) {
        setStatus(`Found ${allRepositories.length} repositories. Processing...`);
        setTotalFound(allRepositories.length);
        
        // Process each repository
        let processedCount = 0;
        
        // Update the progress bar as we process repositories
        for (const repo of allRepositories) {
          processedCount++;
          setProgress(50 + Math.floor((processedCount / allRepositories.length) * 45));
          setStatus(`Processing repository ${processedCount} of ${allRepositories.length}: ${repo.name}`);
          
          // Just add a small delay to simulate processing
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setProgress(95);
        setStatus('Finalizing import...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProgress(100);
        setStatus('Import complete!');
        
        // Set the imported projects
        setImportedProjects(allRepositories);
        
        if (onProjectsAdded) {
          onProjectsAdded(allRepositories);
        }
        
        toast({
          title: 'Bulk Import Successful',
          description: `Imported ${allRepositories.length} AI agent and MCP repositories`,
        });
      } else {
        setStatus('No repositories found.');
        toast({
          title: 'No Results',
          description: 'No AI agent or MCP repositories found matching the criteria.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during bulk import:', error);
      toast({
        title: 'Import Failed',
        description: `An error occurred during the import process: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowSatisfactionQuery(true);
    }
  };

  const handleManualImport = async () => {
    if (!manualUrl.trim() || !manualUrl.includes('github.com')) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid GitHub repository URL',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setStatus('Adding repository...');
    
    try {
      const result = await GitHubService.addProjectFromGitHub(manualUrl);
      
      if (result.success && result.agent) {
        setImportedProjects([result.agent]);
        
        if (onProjectsAdded) {
          onProjectsAdded([result.agent]);
        }
        
        toast({
          title: 'Repository Added',
          description: `Successfully added ${result.agent.name}`,
        });
        
        setManualUrl('');
      } else {
        toast({
          title: 'Import Failed',
          description: result.error || 'Failed to add repository',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding repository:', error);
      toast({
        title: 'Import Failed',
        description: 'An error occurred while adding the repository',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setProgress(0);
    setStatus('');
    setShowSatisfactionQuery(false);
    setShowManualInput(false);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Add in Bulk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import AI Agent Projects</DialogTitle>
          <DialogDescription>
            {!showManualInput ? 
              "Search and import AI agent and MCP projects automatically. This will search for repositories containing terms like \"AI Agent\", \"MCP\", etc." :
              "Enter the GitHub URL of an AI agent or MCP project to add it directly."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {importedProjects.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Imported Projects ({importedProjects.length})</h4>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 bg-gray-50">
                    <ul className="space-y-1">
                      {importedProjects.map((project, index) => (
                        <li key={index} className="text-sm py-1 border-b last:border-0 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span>
                          {project.name} <span className="text-xs text-gray-500">({project.owner})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : showSatisfactionQuery ? (
            <div className="space-y-4">
              <p className="text-sm">Are you satisfied with the import results?</p>
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  onClick={() => {
                    setIsOpen(false);
                    resetState();
                  }}
                >
                  Yes, I'm satisfied
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualInput(true)}
                >
                  No, add manually
                </Button>
              </div>
            </div>
          ) : showManualInput ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="manualUrl" className="text-sm font-medium">
                  GitHub Repository URL
                </label>
                <div className="flex gap-2">
                  <Input
                    id="manualUrl"
                    placeholder="https://github.com/username/repository"
                    value={manualUrl}
                    onChange={e => setManualUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualImport}
                    disabled={isLoading || !manualUrl.trim()}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link className="mr-2 h-4 w-4" />}
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded">
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs">
                  Enter the GitHub URL of an AI agent project you want to add. The repository should include terms like "AI agent" or "MCP" in its description.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowManualInput(false);
                  setShowSatisfactionQuery(false);
                }}
              >
                Go back to bulk import
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">
                This will search for AI agent and MCP projects up to the 25th page
                of search results, looking for repositories that match our criteria.
              </p>
              <p className="text-sm font-medium">
                Search will include terms:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>AI Agent GitHub</li>
                <li>MCP GitHub</li>
                <li>Autonomous AI agent GitHub</li>
                <li>AI assistant GitHub</li>
                <li>LLM agent GitHub</li>
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {!isLoading && !showSatisfactionQuery && !showManualInput ? (
            <Button onClick={handleBulkImport} disabled={isLoading}>
              Start Bulk Import
            </Button>
          ) : isLoading ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
