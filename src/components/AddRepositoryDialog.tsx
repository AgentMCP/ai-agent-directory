import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle } from 'lucide-react';

interface AddRepositoryDialogProps {
  onAdd: (url: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AddRepositoryDialog: React.FC<AddRepositoryDialogProps> = ({
  onAdd,
  onCancel,
  isSubmitting = false
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for GitHub URLs
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!trimmedUrl.includes('github.com/')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setError(null);
    onAdd(trimmedUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-lg border border-white/10">
        <h2 className="text-lg font-bold mb-2">Add GitHub Repository</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the URL of a GitHub repository to add it to the directory.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">GitHub Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/username/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
                className="border-white/10 bg-white/5 text-white focus:border-indigo-500 focus:ring-indigo-500"
              />
              
              {error && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="dark" 
                onClick={onCancel}
                disabled={isSubmitting}
                type="button"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                variant="gradient"
                size="sm"
              >
                {isSubmitting ? 'Adding...' : 'Add Repository'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepositoryDialog;
