import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { toast } from './ui/use-toast';
import { GitHubService } from '../services/GitHubService';
import { ScrapeService } from '../services/ScrapeService';
import { Search, Loader2, Link, AlertCircle, Download, Check, CheckCircle } from 'lucide-react';
import { Agent } from '../types';
import { Input } from './ui/input';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { useAgentStore } from '../stores/agentStore';

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
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '');

  const handleSearch = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('');
    setShowSatisfactionQuery(false);
    
    try {
      // Save GitHub token to localStorage if provided
      if (githubToken.trim()) {
        localStorage.setItem('github_token', githubToken.trim());
      }
      
      setStatus('Searching for AI Agents and MCP repositories...');
      setProgress(10);
      
      // Use the real ScrapeService to find repositories
      const repositories = await ScrapeService.scrapeGitHubRepositories('AI Agent MCP');
      
      setTotalFound(repositories.length);
      setStatus(`Found ${repositories.length} AI Agent and MCP repositories.`);
      setProgress(100);
      
      // Add the repositories to the store
      repositories.forEach(repo => {
        // Just add a small delay to simulate processing
        setTimeout(() => {
          setImportedProjects([...importedProjects, repo]);
        }, 100);
      });
      
      setShowSatisfactionQuery(true);
    } catch (err) {
      console.error('Error importing repositories:', err);
      toast({
        title: 'Import Failed',
        description: `Failed to import repositories. ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <div className="flex flex-col space-y-2">
                <label htmlFor="github-token" className="text-sm font-medium">
                  GitHub Token (Optional)
                </label>
                <Input 
                  id="github-token"
                  type="password"
                  placeholder="ghp_123456789abcdef123456789abcdef"
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    if (e.target.value.trim()) {
                      localStorage.setItem('github_token', e.target.value.trim());
                    }
                  }}
                  className="col-span-3"
                />
                <p className="text-sm text-muted-foreground">
                  Providing a GitHub token will increase rate limits and improve search results.
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline ml-1"
                  >
                    Create a token
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="default"
            onClick={handleSearch}
            disabled={isLoading}
            className="mr-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import Repositories
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
