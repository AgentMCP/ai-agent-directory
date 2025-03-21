import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import AddProjectForm from './AddProjectForm';
import BulkImportForm from './BulkImportModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GitHubService } from '../services/GitHubService';
import { toast } from './ui/use-toast';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProjectModal = ({ isOpen, onClose }: AddProjectModalProps) => {
  const [activeTab, setActiveTab] = useState<string>('single');
  
  const handleProjectAdded = async (url: string) => {
    try {
      await GitHubService.addProject(url);
      toast({
        title: "Success",
        description: "Project added successfully. It will appear in the directory shortly.",
      });
      onClose();
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add project. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleBulkProjectsAdded = async (urls: string[]) => {
    try {
      const results = await GitHubService.addProjects(urls);
      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: "Bulk Import Complete",
        description: `Successfully added ${successCount} out of ${urls.length} projects.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding projects in bulk:', error);
      toast({
        title: "Error",
        description: "Failed to complete bulk import. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Get existing project URLs to avoid duplicates
  const existingProjectUrls = GitHubService.getExistingProjectUrls();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add AI Agent Project</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="single">Single Project</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-0">
            <AddProjectForm 
              onProjectAdded={handleProjectAdded} 
              onCancel={onClose}
            />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-0">
            <BulkImportForm 
              onProjectsAdded={handleBulkProjectsAdded}
              existingProjectUrls={existingProjectUrls}
              onCancel={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
