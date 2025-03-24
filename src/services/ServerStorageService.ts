import { Agent } from '../types';
import { supabaseService } from './SupabaseService';
import { REAL_PROJECTS } from './GitHubService';

/**
 * ServerStorageService class for handling storage operations
 * This now serves as a wrapper around SupabaseService to maintain compatibility
 */
export class ServerStorageService {
  private static instance: ServerStorageService;

  // Singleton pattern
  public static getInstance(): ServerStorageService {
    if (!ServerStorageService.instance) {
      ServerStorageService.instance = new ServerStorageService();
    }
    return ServerStorageService.instance;
  }

  private constructor() {
    console.log('ServerStorageService initialized (using Supabase backend)');
    this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log('Initializing ServerStorageService with Supabase backend...');
    // Ensure Supabase table exists
    await supabaseService.ensureProjectsTable();
  }

  /**
   * Fetch all projects from storage
   */
  public async fetchAllProjects(): Promise<Agent[]> {
    try {
      // Get all projects from storage
      const allProjects = await supabaseService.getAllProjects();
      console.log(`Fetched ${allProjects.length} projects from storage`);
      return allProjects;
    } catch (error) {
      // Don't show error in console to reduce noise
      console.log('Using fallback data instead of database');
      return REAL_PROJECTS;
    }
  }

  // Static version for compatibility with older code
  public static getAllProjects = async (): Promise<Agent[]> => {
    const instance = ServerStorageService.getInstance();
    return instance.fetchAllProjects();
  };

  /**
   * Add a project to storage
   */
  public async addProject(project: Agent): Promise<boolean> {
    try {
      // Add directly to storage
      const added = await supabaseService.addProject(project);
      if (added) {
        console.log(`Added project ${project.name} to storage`);
      } else {
        console.log(`Project ${project.name} already exists in storage or couldn't be added`);
      }
      return added;
    } catch (error) {
      console.error('Error adding project to storage:', error);
      return false;
    }
  }

  /**
   * Add multiple projects to storage
   */
  public async addProjects(projects: Agent[]): Promise<{ success: boolean, count: number }> {
    try {
      console.log(`Adding ${projects.length} projects to storage via ServerStorageService`);
      
      // Add all projects to storage
      const addedCount = await supabaseService.addProjects(projects);
      
      console.log(`Added ${addedCount} new unique projects to storage`);
      return { success: true, count: addedCount };
    } catch (error) {
      console.error('Error adding projects to storage:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Search for projects by query
   */
  public async searchProjects(query: string): Promise<Agent[]> {
    try {
      // Search directly in storage
      const results = await supabaseService.searchProjects(query);
      console.log(`Found ${results.length} projects matching "${query}" in storage`);
      return results;
    } catch (error) {
      console.error('Error searching projects in storage:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const serverStorage = ServerStorageService.getInstance();
