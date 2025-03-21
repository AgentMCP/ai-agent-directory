import { useState } from 'react';
import { GitHubService } from '../services/GitHubService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from './ui/use-toast';
import { Agent } from '../types';
import { Plus, Sparkles, Github, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddProjectFormProps {
  onProjectAdded?: (url: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  showButton?: boolean;
  isOpen?: boolean;
}

const formSchema = z.object({
  githubUrl: z.string()
    .url({ message: "Please enter a valid URL" })
    .refine((url) => url.includes('github.com'), {
      message: "URL must be a GitHub repository",
    }),
});

const AddProjectForm = ({ onProjectAdded, onCancel, onClose, showButton = true, isOpen }: AddProjectFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      githubUrl: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (onProjectAdded) {
        onProjectAdded(values.githubUrl);
      } else {
        const result = await GitHubService.addProject(values.githubUrl);
        
        toast({
          title: "Success",
          description: "Project added to the directory successfully",
        });
        
        form.reset();
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    if (onCancel) {
      onCancel();
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">GitHub Repository URL</FormLabel>
              <FormControl>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input 
                    placeholder="https://github.com/username/repository" 
                    {...field} 
                    disabled={isLoading}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-indigo-500"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-white/60">
                Enter the URL of a GitHub repository containing an AI agent project.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </span>
            ) : 'Add Project'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (!showButton) {
    return formContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="bg-[#1a1f36] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Add AI Agent Project
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Add a GitHub repository to the AI Agent Directory.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectForm;
