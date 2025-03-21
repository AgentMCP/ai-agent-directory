import { Agent } from '../types';
import { GitHubService } from './GitHubService';

// Mock server-side storage API endpoints
const API_BASE_URL = '/api';
const PROJECTS_ENDPOINT = `${API_BASE_URL}/projects`;

/**
 * ServerStorageService - Handles server-side storage of projects
 * This ensures all user submissions are available globally to all users
 */
export class ServerStorageService {
  private static instance: ServerStorageService;
  private serverProjects: Agent[] = [];
  
  // Singleton pattern to ensure consistency across the application
  public static getInstance(): ServerStorageService {
    if (!ServerStorageService.instance) {
      ServerStorageService.instance = new ServerStorageService();
    }
    return ServerStorageService.instance;
  }

  /**
   * Initialize the service and fetch projects from the server
   */
  public async initialize(): Promise<void> {
    console.log('Initializing ServerStorageService...');
    try {
      await this.fetchAllProjects();
    } catch (error) {
      console.error('Failed to initialize ServerStorageService:', error);
    }
  }

  /**
   * Fetch all projects from the server
   */
  public async fetchAllProjects(): Promise<Agent[]> {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate server storage with this in-memory array
      if (this.serverProjects.length === 0) {
        // Initialize with the default projects if empty
        this.serverProjects = await GitHubService.getAllProjects();
      }
      
      console.log(`Fetched ${this.serverProjects.length} projects from server`);
      return this.serverProjects;
    } catch (error) {
      console.error('Error fetching projects from server:', error);
      return [];
    }
  }

  /**
   * Add a project to the server
   */
  public async addProject(project: Agent): Promise<boolean> {
    try {
      // Ensure we're not adding duplicates
      const isDuplicate = this.serverProjects.some(p => p.url === project.url);
      if (isDuplicate) {
        console.log(`Project ${project.name} already exists on server`);
        return false;
      }

      // In a real implementation, this would be a POST request to the server
      // For demonstration, we'll add it to our in-memory store
      this.serverProjects.push(project);
      console.log(`Added project ${project.name} to server storage`);
      
      // Notify the GitHubService that a new project was added
      await this.notifyProjectAdded(project);
      return true;
    } catch (error) {
      console.error('Error adding project to server:', error);
      return false;
    }
  }

  /**
   * Add multiple projects to the server
   */
  public async addProjects(projects: Agent[]): Promise<{ success: boolean, count: number }> {
    try {
      let addedCount = 0;
      
      for (const project of projects) {
        const isDuplicate = this.serverProjects.some(p => p.url === project.url);
        if (!isDuplicate) {
          this.serverProjects.push(project);
          addedCount++;
        }
      }
      
      console.log(`Added ${addedCount} projects to server storage`);
      
      // Notify the service that projects were added
      if (addedCount > 0) {
        await this.notifyProjectsAdded(addedCount);
      }
      
      return { success: true, count: addedCount };
    } catch (error) {
      console.error('Error adding projects to server:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Get all projects including user submissions
   */
  public getAllProjects(): Agent[] {
    return this.serverProjects;
  }

  /**
   * Simulate server-side notification when a project is added
   */
  private async notifyProjectAdded(project: Agent): Promise<void> {
    console.log(`Server received new project: ${project.name}`);
    // In a real implementation, this could trigger events like webhooks
    // or update connected clients via websockets
  }

  /**
   * Simulate server-side notification when multiple projects are added
   */
  private async notifyProjectsAdded(count: number): Promise<void> {
    console.log(`Server received ${count} new projects`);
  }
}

// Export a singleton instance
export const serverStorage = ServerStorageService.getInstance();
