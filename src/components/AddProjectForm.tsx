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

interface AddProjectFormProps {
  onProjectAdded?: (agent: Agent) => void;
}

const formSchema = z.object({
  githubUrl: z.string()
    .url({ message: "Please enter a valid URL" })
    .refine((url) => url.includes('github.com'), {
      message: "URL must be a GitHub repository",
    }),
});

const AddProjectForm = ({ onProjectAdded }: AddProjectFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
      const result = await GitHubService.addProjectFromGitHub(values.githubUrl);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Project added to the directory successfully",
        });
        if (onProjectAdded) {
          onProjectAdded(result.agent);
        }
        setIsOpen(false);
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add project. Repository must contain 'AI agent' or 'MCP' in its description.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add AI Agent Project</DialogTitle>
          <DialogDescription>
            Enter a GitHub repository URL to add it to the directory. The repository should be an AI agent project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repository URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/username/repository" {...field} />
                  </FormControl>
                  <FormDescription>
                    Repository must contain 'AI agent' or 'MCP' in its description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectForm;
