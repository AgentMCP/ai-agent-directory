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
    // Nothing to do here, as we'll always get the full list from GitHubService
  }

  /**
   * Fetch all projects from the server
   */
  public async fetchAllProjects(): Promise<Agent[]> {
    try {
      // Always get the full list of projects directly from GitHubService
      const allProjects = await GitHubService.fetchAgents();
      
      console.log(`Fetched ${allProjects.length} projects from GitHubService`);
      return allProjects;
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
      // Since we're not managing state directly, just pass to GitHubService
      // The project will be added to the USER_SUBMITTED_PROJECTS in GitHubService
      await GitHubService.addProject(project.url);
      console.log(`Added project ${project.name} via GitHubService`);
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
        try {
          await GitHubService.addProject(project.url);
          addedCount++;
        } catch (error) {
          console.error(`Failed to add project ${project.name}:`, error);
        }
      }
      
      console.log(`Added ${addedCount} projects via GitHubService`);
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
    try {
      // Return the server projects safely without creating a circular dependency
      // Use an import from GitHubService.REAL_PROJECTS directly
      const moduleExports = require('./GitHubService');
      if (moduleExports && moduleExports.REAL_PROJECTS) {
        console.log(`Returning ${moduleExports.REAL_PROJECTS.length} real projects from ServerStorageService`);
        return moduleExports.REAL_PROJECTS;
      }
      console.warn('Could not get REAL_PROJECTS');
      return [];
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const serverStorage = ServerStorageService.getInstance();
