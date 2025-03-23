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
        // Table doesn't exist or other Supabase error
        console.warn('Supabase error detected, using REAL_PROJECTS fallback:', error);
        this.isSupabaseAvailable = false;
      } else {
        console.log('Supabase projects table exists and is available');
        this.isSupabaseAvailable = true;
      }
    } catch (error) {
      console.error('Failed to check Supabase availability:', error);
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
              console.error('Error seeding projects table:', seedError);
            } else {
              console.log(`Seeded projects table with ${REAL_PROJECTS.length} initial projects`);
            }
          }
        }
      } catch (error) {
        console.error('Error checking table data:', error);
      }
    }
  }

  /**
   * Get all projects from Supabase or fallback to REAL_PROJECTS
   */
  public async getAllProjects(): Promise<Agent[]> {
    // If Supabase is not available, use REAL_PROJECTS
    if (!this.isSupabaseAvailable) {
      console.log(`Using REAL_PROJECTS fallback - returning ${REAL_PROJECTS.length} projects`);
      return REAL_PROJECTS;
    }
    
    try {
      console.log('Fetching all projects from Supabase');
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*');

      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        this.isSupabaseAvailable = false;
        return REAL_PROJECTS;
      }

      if (!data || data.length === 0) {
        console.log('No projects found in Supabase, returning REAL_PROJECTS');
        return REAL_PROJECTS;
      }

      console.log(`Fetched ${data.length} projects from Supabase`);
      return data;
    } catch (error) {
      console.error('Failed to fetch projects from Supabase:', error);
      this.isSupabaseAvailable = false;
      return REAL_PROJECTS;
    }
  }

  /**
   * Add a single project to Supabase
   */
  public async addProject(project: Agent): Promise<boolean> {
    // If Supabase is not available, can't add project
    if (!this.isSupabaseAvailable) {
      console.warn('Supabase not available, cannot add project');
      return false;
    }
    
    try {
      console.log('Adding project to Supabase:', project.name);
      
      // First check if project already exists by URL
      const { data: existingData, error: checkError } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .eq('url', project.url)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking if project exists in Supabase:', checkError);
        return false;
      }
      
      if (existingData) {
        console.log('Project already exists in Supabase:', project.url);
        return false;
      }

      // Add new project
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .insert([project]);

      if (error) {
        console.error('Error adding project to Supabase:', error);
        return false;
      }

      console.log('Successfully added project to Supabase:', project.name);
      return true;
    } catch (error) {
      console.error('Failed to add project to Supabase:', error);
      return false;
    }
  }

  /**
   * Add multiple projects to Supabase
   */
  public async addProjects(projects: Agent[]): Promise<number> {
    // If Supabase is not available, can't add projects
    if (!this.isSupabaseAvailable) {
      console.warn('Supabase not available, cannot add projects');
      return 0;
    }
    
    try {
      console.log(`Adding ${projects.length} projects to Supabase`);
      
      // Get existing URLs to avoid duplicates
      const { data: existingProjects, error: fetchError } = await supabase
        .from(PROJECTS_TABLE)
        .select('url');
      
      if (fetchError) {
        console.error('Error fetching existing projects from Supabase:', fetchError);
        return 0;
      }
      
      const existingUrls = new Set((existingProjects || []).map(p => p.url));
      const newProjects = projects.filter(p => !existingUrls.has(p.url));
      
      if (newProjects.length === 0) {
        console.log('No new projects to add to Supabase');
        return 0;
      }
      
      // Add new projects in chunks to avoid request size limits
      const chunkSize = 50;
      let addedCount = 0;
      
      for (let i = 0; i < newProjects.length; i += chunkSize) {
        const chunk = newProjects.slice(i, i + chunkSize);
        try {
          const { error } = await supabase
            .from(PROJECTS_TABLE)
            .insert(chunk);
          
          if (error) {
            console.error('Error adding projects chunk to Supabase:', error);
          } else {
            addedCount += chunk.length;
          }
        } catch (chunkError) {
          console.error('Exception adding projects chunk to Supabase:', chunkError);
          // Continue with next chunk
        }
      }
      
      console.log(`Successfully added ${addedCount} projects to Supabase`);
      return addedCount;
    } catch (error) {
      console.error('Fatal error in addProjects:', error);
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
      console.error('Error searching projects:', error);
      this.isSupabaseAvailable = false;
      return this.searchProjects(query); // Recursive call using REAL_PROJECTS
    }
  }
}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();
