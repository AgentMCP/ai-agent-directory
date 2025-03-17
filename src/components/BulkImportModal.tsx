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

interface BulkImportModalProps {
  onProjectsAdded?: (agents: Agent[]) => void;
  existingProjectUrls?: string[]; // List of existing project URLs to prevent duplicates
}

const BulkImportModal = ({ onProjectsAdded, existingProjectUrls = [] }: BulkImportModalProps) => {
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
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Agent[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  // Track if this is the first import session
  const [isFirstImport, setIsFirstImport] = useState(() => {
    return localStorage.getItem('has_imported_repos') !== 'true';
  });

  const handleSearch = async () => {
    setIsLoading(true);
    setProgress(0);
    setShowSatisfactionQuery(false);
    setError(null);
    setImportedProjects([]);
    setShowResults(false);
    setSearchResults([]);
    setImportedCount(0);

    try {
      // Save GitHub token to localStorage if provided
      if (githubToken.trim()) {
        localStorage.setItem('github_token', githubToken.trim());
      }

      setStatus('Searching for AI Agent and MCP repositories...');
      setProgress(5);

      // Get the maximum allowed import count based on whether this is the first import
      const maxResults = isFirstImport ? 250 : 100;
      setStatus(`Searching for AI Agent and MCP repositories (max ${maxResults})...`);

      // Call the scrapeGitHubRepositories method to fetch repositories
      const repositories = await ScrapeService.scrapeGitHubRepositories('AI Agent MCP', isFirstImport);

      // Filter out repositories that already exist
      const newRepositories = repositories.filter(repo => 
        !existingProjectUrls.includes(repo.url)
      );

      setStatus(`Found ${repositories.length} repositories, ${newRepositories.length} are new.`);
      setProgress(50);

      // Mark that we've done an import
      if (isFirstImport) {
        localStorage.setItem('has_imported_repos', 'true');
        setIsFirstImport(false);
      }

      // Add small delays between processing each repository to show progress
      const processedRepos: Agent[] = [];
      for (let i = 0; i < newRepositories.length; i++) {
        const repo = newRepositories[i];
        processedRepos.push(repo);

        // Update progress
        const currentProgress = 50 + Math.floor((i / newRepositories.length) * 50);
        setProgress(currentProgress);
        setStatus(`Processing repository ${i + 1} of ${newRepositories.length}: ${repo.name}`);

        // Update displayed repositories immediately without setTimeout
        setImportedProjects([...processedRepos]);

        // Add a small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setTotalFound(newRepositories.length);
      setStatus(`Imported ${newRepositories.length} AI Agent and MCP repositories.`);
      setProgress(100);

      // Add the repositories to the results
      setShowResults(true);
      setSearchResults(newRepositories);
      setImportedCount(newRepositories.length);

      // If onProjectsAdded callback is provided, call it
      if (onProjectsAdded && newRepositories.length > 0) {
        onProjectsAdded(newRepositories);
      }

      setShowSatisfactionQuery(true);

      // Show a success toast
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${newRepositories.length} AI Agent and MCP repositories.`,
      });
    } catch (error: any) {
      console.error('Error during repository search:', error);

      setError(`Error searching repositories: ${error.message || 'Unknown error'}`);
      setStatus('Error searching repositories');
      setProgress(0);

      // Try to load fallback repositories
      try {
        const fallbackRepos = ScrapeService.getFallbackRepositories(isFirstImport);

        // Filter out repositories that already exist
        const newFallbackRepos = fallbackRepos.filter(repo => 
          !existingProjectUrls.includes(repo.url)
        );

        if (newFallbackRepos.length > 0) {
          setImportedProjects(newFallbackRepos);
          setSearchResults(newFallbackRepos);
          setImportedCount(newFallbackRepos.length);
          setTotalFound(newFallbackRepos.length);
          setStatus(`Loaded ${newFallbackRepos.length} fallback repositories.`);
          setShowResults(true);

          // If onProjectsAdded callback is provided, call it with fallback repos
          if (onProjectsAdded) {
            onProjectsAdded(newFallbackRepos);
          }

          toast({
            title: 'Using Fallback Data',
            description: `Loaded ${newFallbackRepos.length} sample AI Agent and MCP repositories as a fallback.`,
          });

          // Mark that we've done an import if this is the first one
          if (isFirstImport) {
            localStorage.setItem('has_imported_repos', 'true');
            setIsFirstImport(false);
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'No New Repositories',
            description: 'No new repositories found to import.',
          });
        }
      } catch (fallbackError) {
        console.error('Error loading fallback repositories:', fallbackError);
      }
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
              "Enter the GitHub URL of an AI agent project you want to add. The repository should include terms like \"AI agent\" or \"MCP\" in its description."
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
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="github-token">GitHub Token (Optional)</Label>
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

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{status}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {importedProjects.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Imported Repositories ({importedProjects.length})</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <ul className="divide-y">
                      {importedProjects.map((project, index) => (
                        <li key={`${project.id || index}`} className="p-2 hover:bg-gray-50 flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{project.name}</span>
                          <span className="text-sm text-gray-500">({project.owner})</span>
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline ml-auto text-sm flex items-center"
                          >
                            <Link className="h-3 w-3 mr-1" /> View
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
