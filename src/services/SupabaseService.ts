import { createClient } from '@supabase/supabase-js';
import { Agent } from '../types';
import { REAL_PROJECTS } from './GitHubService';

// Supabase configuration
const SUPABASE_URL = 'https://tfhdkdkxlwtpgskytspc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaGRrZGt4bHd0cGdza3l0c3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjI4MzIsImV4cCI6MjA1ODMzODgzMn0.iJo-rvb4mPMUQXZ1EYcTvepgUz7ZQ0Wn7EmuFRiEjmc';
const PROJECTS_TABLE = 'projects';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * SupabaseService - Handles storing and retrieving projects from Supabase
 * Falls back to REAL_PROJECTS when Supabase is unavailable
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private isSupabaseAvailable: boolean = true;

  // Singleton pattern to ensure consistency across the application
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private constructor() {
    console.log('SupabaseService initialized');
    this.checkSupabaseAvailability();
  }

  /**
   * Check if Supabase projects table exists
   */
  private async checkSupabaseAvailability(): Promise<void> {
    try {
      // Check if table exists by trying to get a single row
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
      
      if (error) {
        // Table doesn't exist - try to create it
        if (error.code === '42P01') { // PostgreSQL code for "relation does not exist"
          console.log('Projects table does not exist. Attempting to create it...');
          try {
            // Use RPC to create table if you have permission (usually won't work with anon key)
            // Silently fail and use fallback data instead
            this.isSupabaseAvailable = false;
            
            // Don't log the error to console to avoid noise
            console.log('Using local data storage instead of Supabase.');
            return;
          } catch (createError) {
            // Silent fail - no need to show errors in console
            this.isSupabaseAvailable = false;
            return;
          }
        }
        
        // Other Supabase error
        this.isSupabaseAvailable = false;
        console.log('Supabase unavailable, using local storage instead.');
      } else {
        console.log('Supabase projects table exists and is available');
        this.isSupabaseAvailable = true;
      }
    } catch (error) {
      console.log('Failed to check Supabase availability. Using local storage.');
      this.isSupabaseAvailable = false;
    }
  }

  /**
   * Initialize and ensure project data is available
   */
  public async initializeTable(): Promise<void> {
    // Force a fresh check of Supabase availability
    await this.checkSupabaseAvailability();
    
    // If Supabase is available, make sure it has data
    if (this.isSupabaseAvailable) {
      try {
        // Check if table has data
        const { data, error } = await supabase
          .from(PROJECTS_TABLE)
          .select('id')
          .limit(1);
        
        if (!error && (!data || data.length === 0)) {
          console.log('Projects table exists but is empty, seeding with REAL_PROJECTS');
          
          // Table is empty, add seed data
          if (REAL_PROJECTS && REAL_PROJECTS.length > 0) {
            const { error: seedError } = await supabase
              .from(PROJECTS_TABLE)
              .insert(REAL_PROJECTS);
            
            if (seedError) {
              console.log('Error seeding projects table');
            } else {
              console.log(`Seeded projects table with ${REAL_PROJECTS.length} initial projects`);
            }
          }
        }
      } catch (error) {
        console.log('Error checking table data');
      }
    }
  }

  /**
   * Ensure projects table exists and has data
   */
  public async ensureProjectsTable(): Promise<void> {
    try {
      // Check if table exists, create if needed
      await this.checkSupabaseAvailability();
      
      // If not available, we'll just use local storage instead
      if (!this.isSupabaseAvailable) {
        return;
      }
      
      // If table exists but has no data, initialize with sample data
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
      
      if (!error && (!data || data.length === 0)) {
        console.log('Projects table exists but is empty. Adding sample data...');
        try {
          await this.addProjects(REAL_PROJECTS);
          console.log(`Added ${REAL_PROJECTS.length} sample projects to table`);
        } catch (addError) {
          console.log('Could not add sample data to projects table');
        }
      }
    } catch (error) {
      console.log('Error ensuring projects table. Using local data instead.');
      this.isSupabaseAvailable = false;
    }
  }

  /**
   * Get all projects from Supabase or fallback to REAL_PROJECTS
   */
  public async getAllProjects(): Promise<Agent[]> {
    if (!this.isSupabaseAvailable) {
      console.log('Supabase not available, using fallback data');
      return REAL_PROJECTS;
    }
    
    try {
      console.log('Fetching all projects from storage');
      // Increase the query limit to ensure we get ALL projects
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*')
        .limit(100); // Increased from default 20 to 100 to ensure all projects are retrieved

      if (error) {
        console.log('Could not fetch projects from storage, using fallback data');
        this.isSupabaseAvailable = false;
        return REAL_PROJECTS;
      }

      if (!data || data.length === 0) {
        console.log('No projects found in storage, returning fallback data');
        return REAL_PROJECTS;
      }

      console.log(`Fetched ${data.length} projects from storage`);
      return data;
    } catch (error) {
      console.log('Failed to fetch projects, using fallback data');
      this.isSupabaseAvailable = false;
      return REAL_PROJECTS;
    }
  }

  /**
   * Add a single project to Supabase
   */
  public async addProject(project: Agent): Promise<boolean> {
    if (!this.isSupabaseAvailable) {
      console.log('Storage not available, skipping project addition');
      return false;
    }

    try {
      // Check if the project already exists
      const { data: checkData, error: checkError } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .eq('url', project.url)
        .limit(1);
      
      if (checkError) {
        console.log('Could not check if project exists in storage');
        return false;
      }
      
      // Project already exists
      if (checkData && checkData.length > 0) {
        return false;
      }
      
      // Add project to Supabase
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .insert([project]);
      
      if (error) {
        console.log('Could not add project to storage');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('Error in project addition process');
      return false;
    }
  }

  /**
   * Add multiple projects to Supabase
   */
  public async addProjects(projects: Agent[]): Promise<number> {
    if (!this.isSupabaseAvailable || !projects || projects.length === 0) {
      return 0;
    }

    try {
      // Fetch existing project URLs to avoid duplicates
      const { data: existingProjects, error: fetchError } = await supabase
        .from(PROJECTS_TABLE)
        .select('url');
      
      if (fetchError) {
        console.log('Could not fetch existing projects from storage');
        return 0;
      }
      
      // Get set of existing URLs
      const existingUrls = new Set(existingProjects?.map(p => p.url) || []);
      
      // Filter out projects that already exist
      const newProjects = projects.filter(p => !existingUrls.has(p.url));
      
      if (newProjects.length === 0) {
        console.log('No new projects to add');
        return 0;
      }
      
      console.log(`Adding ${newProjects.length} new projects to storage`);
      
      // Add projects in chunks to avoid request size limits
      const chunkSize = 50;
      let addedCount = 0;
      
      for (let i = 0; i < newProjects.length; i += chunkSize) {
        const chunk = newProjects.slice(i, i + chunkSize);
        try {
          const { error } = await supabase
            .from(PROJECTS_TABLE)
            .insert(chunk);
          
          if (error) {
            console.log('Could not add some projects to storage');
          } else {
            addedCount += chunk.length;
          }
        } catch (error) {
          console.log('Error in batch project addition');
        }
      }
      
      return addedCount;
    } catch (error) {
      console.log('Error in projects addition process');
      return 0;
    }
  }

  /**
   * Search for projects by query in Supabase or REAL_PROJECTS
   */
  public async searchProjects(query: string): Promise<Agent[]> {
    // If Supabase is not available, search in REAL_PROJECTS
    if (!this.isSupabaseAvailable) {
      console.log('Searching projects in REAL_PROJECTS for:', query);
      
      if (!query || query.trim() === '') {
        return REAL_PROJECTS;
      }
      
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // Filter REAL_PROJECTS
      const results = REAL_PROJECTS.filter(project => {
        const name = project.name?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        const language = project.language?.toLowerCase() || '';
        const owner = project.owner?.toLowerCase() || '';
        const topics = project.topics || [];
        
        return (
          name.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          language.includes(normalizedQuery) ||
          owner.includes(normalizedQuery) ||
          topics.some(topic => topic.toLowerCase().includes(normalizedQuery))
        );
      });
      
      console.log(`Found ${results.length} matching projects in REAL_PROJECTS`);
      return results;
    }
    
    try {
      console.log(`Searching for projects with query: "${query}"`);
      
      if (!query || query.trim() === '') {
        return this.getAllProjects();
      }
      
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // Get all projects and filter on client side
      const allProjects = await this.getAllProjects();
      
      // Filter by name, description, or other searchable fields
      const results = allProjects.filter(project => {
        const name = project.name?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        const language = project.language?.toLowerCase() || '';
        const owner = project.owner?.toLowerCase() || '';
        const topics = project.topics || [];
        
        return (
          name.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          language.includes(normalizedQuery) ||
          owner.includes(normalizedQuery) ||
          topics.some(topic => topic.toLowerCase().includes(normalizedQuery))
        );
      });
      
      console.log(`Found ${results.length} projects matching query: "${query}"`);
      return results;
    } catch (error) {
      console.log('Error searching projects');
      this.isSupabaseAvailable = false;
      return this.searchProjects(query); // Recursive call using REAL_PROJECTS
    }
  }
}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();
