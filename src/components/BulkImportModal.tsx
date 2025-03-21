import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, Link, Search, Loader2, AlertCircle, Download, Sparkles, Plus } from 'lucide-react';
import { Agent } from '../types';
import { ScrapeService } from '../services/ScrapeService';
import { useAuth } from '../contexts/AuthContext';
import { saveUserSearch } from '../services/firebase';
import { motion } from 'framer-motion';

interface BulkImportModalProps {
  onProjectsAdded?: (urls: string[]) => void;
  existingProjectUrls?: string[];
  onCancel?: () => void;
}

const BulkImportModal = ({ onProjectsAdded, existingProjectUrls = [], onCancel }: BulkImportModalProps) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importedProjects, setImportedProjects] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [totalFound, setTotalFound] = useState(0);
  const [showSatisfactionQuery, setShowSatisfactionQuery] = useState(false);
  const [isFirstImport, setIsFirstImport] = useState(true);
  const [manualUrl, setManualUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('AI Agent MCP');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    // Check if we've done an import before
    const hasImported = localStorage.getItem('has_imported_repos') === 'true';
    setIsFirstImport(!hasImported);

    // Load GitHub token from localStorage if available
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
    }
    
    // Check for reimport repositories
    const reimportRepos = localStorage.getItem('reimport_repositories');
    if (reimportRepos) {
      try {
        const repos = JSON.parse(reimportRepos);
        if (Array.isArray(repos) && repos.length > 0) {
          setImportedProjects(repos);
          setSearchResults(repos);
          setImportedCount(repos.length);
          setTotalFound(repos.length);
          setShowResults(true);
          
          // If onProjectsAdded callback is provided, call it with reimported repos
          if (onProjectsAdded) {
            onProjectsAdded(repos);
          }
          
          // Clear the reimport data
          localStorage.removeItem('reimport_repositories');
          
          toast({
            title: 'Repositories Loaded',
            description: `Loaded ${repos.length} repositories from your search history.`,
          });
        }
      } catch (error) {
        console.error('Error parsing reimport repositories:', error);
        localStorage.removeItem('reimport_repositories');
      }
    }
  }, [onProjectsAdded, toast]);
  
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
      let repositories: Agent[] = [];
      try {
        repositories = await ScrapeService.scrapeGitHubRepositories(searchQuery, isFirstImport);
        
        // Validate that we received proper data
        if (!Array.isArray(repositories)) {
          console.error('Repository search did not return an array:', repositories);
          throw new Error('Invalid repository data received');
        }
      } catch (searchError) {
        console.error('Error during repository search:', searchError);
        setStatus('Error in repository search, using fallback data...');
        repositories = ScrapeService.getFallbackRepositories(isFirstImport);
      }

      // Filter out repositories that already exist and any invalid entries
      const newRepositories = repositories.filter(repo => 
        repo && repo.url && !existingProjectUrls?.includes(repo.url)
      );

      setStatus(`Found ${repositories.length} repositories, ${newRepositories.length} are new.`);
      setProgress(50);

      // Mark that we've done an import
      if (isFirstImport) {
        localStorage.setItem('has_imported_repos', 'true');
        setIsFirstImport(false);
      }

      // Process repositories in batches to avoid UI freezing
      const processedRepos: string[] = [];
      const batchSize = 10;
      
      for (let i = 0; i < newRepositories.length; i += batchSize) {
        const batch = newRepositories.slice(i, i + batchSize);
        
        for (const repo of batch) {
          if (repo) {
            processedRepos.push(repo.url);
            
            // Update progress
            const currentProgress = 50 + Math.floor((processedRepos.length / newRepositories.length) * 50);
            setProgress(currentProgress);
            setStatus(`Processing repository ${processedRepos.length} of ${newRepositories.length}: ${repo.name || 'Unnamed Repository'}`);
            
            // Update displayed repositories immediately
            setImportedProjects([...processedRepos]);
          }
        }
        
        // Add a small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setTotalFound(newRepositories.length);
      setStatus(`Imported ${newRepositories.length} AI Agent and MCP repositories.`);
      setProgress(100);

      // Add the repositories to the results
      setShowResults(true);
      setSearchResults(newRepositories.map(repo => repo.url));
      setImportedCount(newRepositories.length);

      // If onProjectsAdded callback is provided, call it
      if (onProjectsAdded && newRepositories.length > 0) {
        onProjectsAdded(newRepositories.map(repo => repo.url));
      }

      // Save search to user's account if logged in
      if (currentUser && newRepositories.length > 0) {
        try {
          await saveUserSearch(
            currentUser.uid,
            searchQuery,
            newRepositories.map(repo => repo.url)
          );
          
          toast({
            title: 'Search Saved',
            description: 'Your search has been saved to your account.',
          });
        } catch (saveError) {
          console.error('Error saving search:', saveError);
          // Don't show error to user, just log it
        }
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
          repo && repo.url && !existingProjectUrls?.includes(repo.url)
        );

        if (newFallbackRepos.length > 0) {
          setImportedProjects(newFallbackRepos.map(repo => repo.url));
          setSearchResults(newFallbackRepos.map(repo => repo.url));
          setImportedCount(newFallbackRepos.length);
          setTotalFound(newFallbackRepos.length);
          setStatus(`Loaded ${newFallbackRepos.length} fallback repositories.`);
          setShowResults(true);

          // If onProjectsAdded callback is provided, call it with fallback repos
          if (onProjectsAdded) {
            onProjectsAdded(newFallbackRepos.map(repo => repo.url));
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
      const result = await ScrapeService.addProjectFromGitHub(manualUrl);

      if (result.success && result.agent) {
        setImportedProjects([manualUrl]);

        if (onProjectsAdded) {
          onProjectsAdded([manualUrl]);
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
    setShowFeedbackForm(false);
    setFeedbackMessage('');
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      resetState();
      if (onCancel) {
        onCancel();
      }
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button 
          id="bulkImportTrigger"
          variant="outline" 
          className="flex items-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-indigo-500/30"
        >
          <Plus className="w-4 h-4" />
          Add in Bulk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1f36] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Bulk Import AI Agent Projects
          </DialogTitle>
          <DialogDescription className="text-white/70">
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
                <div className="flex justify-between text-sm text-white/80">
                  <span>{status}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>

              {importedProjects.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-white/90">Imported Projects ({importedProjects.length})</h4>
                  <div className="max-h-[200px] overflow-y-auto border border-white/10 rounded-md p-2 bg-white/5">
                    <ul className="space-y-1">
                      {importedProjects.map((project, index) => (
                        <li key={index} className="text-sm py-1 border-b border-white/10 last:border-0 flex items-center gap-2 text-white/80">
                          <span className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</span>
                          {project} 
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : showSatisfactionQuery ? (
            <div className="space-y-4">
              <p className="text-sm text-white/80">Are you satisfied with the import results?</p>
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  onClick={() => {
                    setIsOpen(false);
                    resetState();
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none"
                >
                  Yes, I'm satisfied
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackForm(true)}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  No, provide feedback
                </Button>
              </div>
            </div>
          ) : showFeedbackForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-white/90">What could be improved?</Label>
                <textarea 
                  id="feedback"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full h-32 rounded-md border border-white/10 bg-white/5 text-white p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Please share your feedback..."
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  onClick={() => {
                    // Here you would typically send the feedback to a server
                    toast({
                      title: 'Feedback Submitted',
                      description: 'Thank you for your feedback!',
                    });
                    setIsOpen(false);
                    resetState();
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none"
                >
                  Submit Feedback
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackForm(false)}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              </div>
            </div>
          ) : showResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/90">Found {totalFound} repositories</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (onProjectsAdded) {
                      onProjectsAdded(searchResults);
                    }
                    setIsOpen(false);
                    resetState();
                  }}
                  className="text-xs border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Import All
                </Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto border border-white/10 rounded-md bg-white/5">
                <ul className="divide-y divide-white/10">
                  {searchResults.map((url, index) => (
                    <motion.li 
                      key={index} 
                      className="p-2 text-sm flex items-center justify-between hover:bg-white/5"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline flex items-center"
                      >
                        <Link className="w-3 h-3 mr-1 flex-shrink-0" />
                        {url.replace('https://github.com/', '')}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowResults(false);
                    setShowManualInput(false);
                  }}
                  className="text-xs border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  Back to Search
                </Button>
              </div>
            </div>
          ) : showManualInput ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-url" className="text-white/90">GitHub Repository URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="manual-url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-indigo-500"
                  />
                  <Button 
                    onClick={handleManualImport}
                    disabled={!manualUrl.includes('github.com/')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none"
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowManualInput(false)}
                  className="text-xs border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  Back to Search
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-query" className="text-white/90">Search Query</Label>
                <Input 
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="AI Agent MCP"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-indigo-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github-token" className="text-white/90">GitHub Token (Optional)</Label>
                <Input 
                  id="github-token"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  type="password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-indigo-500"
                />
                <p className="text-xs text-white/60">
                  A GitHub token increases search limits. <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Get a token</a>
                </p>
              </div>
              
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!isLoading && !showResults && !showSatisfactionQuery && !showFeedbackForm && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowManualInput(!showManualInput)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                {showManualInput ? 'Auto Search' : 'Manual Entry'}
              </Button>
              
              <Button 
                onClick={showManualInput ? handleManualImport : handleSearch}
                disabled={showManualInput ? !manualUrl.includes('github.com/') : false}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none"
              >
                {showManualInput ? 'Add Repository' : 'Search Repositories'}
              </Button>
            </>
          )}
          
          {isLoading && (
            <Button variant="outline" onClick={() => setIsLoading(false)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
