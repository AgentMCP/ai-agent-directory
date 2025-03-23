import { Agent } from '../types';
import { supabaseService } from './SupabaseService';

/**
 * ServerStorageService - Handles server-side storage of projects
 * This now serves as a wrapper around SupabaseService to maintain compatibility
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

  private constructor() {
    console.log('ServerStorageService initialized (using Supabase backend)');
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    console.log('Initializing ServerStorageService with Supabase backend...');
    // Ensure Supabase table exists
    await supabaseService.initializeTable();
  }

  /**
   * Fetch all projects from Supabase
   */
  public async fetchAllProjects(): Promise<Agent[]> {
    try {
      // Get all projects from Supabase
      const allProjects = await supabaseService.getAllProjects();
      console.log(`Fetched ${allProjects.length} projects from Supabase`);
      return allProjects;
    } catch (error) {
      console.error('Error fetching projects from Supabase:', error);
      return [];
    }
  }

  /**
   * Add a project to Supabase
   */
  public async addProject(project: Agent): Promise<boolean> {
    try {
      // Add directly to Supabase
      const added = await supabaseService.addProject(project);
      if (added) {
        console.log(`Added project ${project.name} to Supabase`);
      } else {
        console.log(`Project ${project.name} already exists in Supabase or couldn't be added`);
      }
      return added;
    } catch (error) {
      console.error('Error adding project to Supabase:', error);
      return false;
    }
  }

  /**
   * Add multiple projects to Supabase
   */
  public async addProjects(projects: Agent[]): Promise<{ success: boolean, count: number }> {
    try {
      console.log(`Adding ${projects.length} projects to Supabase via ServerStorageService`);
      
      // Add all projects to Supabase
      const addedCount = await supabaseService.addProjects(projects);
      
      console.log(`Added ${addedCount} new unique projects to Supabase`);
      return { success: true, count: addedCount };
    } catch (error) {
      console.error('Error adding projects to Supabase:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Search for projects by query
   */
  public async searchProjects(query: string): Promise<Agent[]> {
    try {
      // Search directly in Supabase
      const results = await supabaseService.searchProjects(query);
      console.log(`Found ${results.length} projects matching "${query}" in Supabase`);
      return results;
    } catch (error) {
      console.error('Error searching projects in Supabase:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const serverStorage = ServerStorageService.getInstance();
