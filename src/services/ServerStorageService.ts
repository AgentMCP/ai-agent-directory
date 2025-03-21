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

  private constructor() {
    console.log('ServerStorageService initialized');
    this.loadInitialProjects();
  }

  /**
   * Initialize with any existing projects from elsewhere
   */
  private loadInitialProjects(): void {
    try {
      // In a real implementation, this would fetch from a database
      this.serverProjects = [];
      console.log(`ServerStorageService initialized with ${this.serverProjects.length} projects`);
    } catch (error) {
      console.error('Error loading initial projects:', error);
      this.serverProjects = [];
    }
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
      console.log(`Adding ${projects.length} projects to server storage`);
      let addedCount = 0;
      
      for (const project of projects) {
        if (!this.serverProjects.some(p => p.url === project.url)) {
          this.serverProjects.push(project);
          addedCount++;
        }
      }
      
      console.log(`Added ${addedCount} new unique projects to server storage, Total: ${this.serverProjects.length}`);
      
      // Export data to REAL_PROJECTS for global access
      try {
        const moduleExports = require('./GitHubService');
        if (moduleExports && moduleExports.USER_SUBMITTED_PROJECTS) {
          moduleExports.USER_SUBMITTED_PROJECTS = [...moduleExports.USER_SUBMITTED_PROJECTS, ...projects];
          console.log(`Updated USER_SUBMITTED_PROJECTS with ${projects.length} new projects`);
        }
      } catch (err) {
        console.error('Error updating USER_SUBMITTED_PROJECTS:', err);
      }
      
      return { success: true, count: addedCount };
    } catch (error) {
      console.error('Error adding projects:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Get all projects including user submissions
   */
  public getAllProjects(): Agent[] {
    try {
      // Return all server projects 
      console.log(`Returning ${this.serverProjects.length} projects from ServerStorageService`);
      return this.serverProjects;
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const serverStorage = ServerStorageService.getInstance();
