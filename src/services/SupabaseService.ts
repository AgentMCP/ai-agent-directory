import { createClient } from '@supabase/supabase-js';
import { Agent } from '../types';

// Supabase configuration
const SUPABASE_URL = 'https://tfhdkdkxlwtpgskytspc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaGRrZGt4bHd0cGdza3l0c3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjI4MzIsImV4cCI6MjA1ODMzODgzMn0.iJo-rvb4mPMUQXZ1EYcTvepgUz7ZQ0Wn7EmuFRiEjmc';
const PROJECTS_TABLE = 'projects';
const LOCAL_STORAGE_KEY = 'ai_agent_directory_projects';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * SupabaseService - Handles storing and retrieving projects from Supabase
 * Includes fallback to local storage when Supabase is unavailable
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private isSupabaseAvailable: boolean = true;
  private localProjects: Agent[] = [];

  // Singleton pattern to ensure consistency across the application
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private constructor() {
    console.log('SupabaseService initialized');
    this.loadLocalProjects();
    this.checkSupabaseAvailability();
  }

  /**
   * Load projects from local storage as fallback
   */
  private loadLocalProjects(): void {
    try {
      const projectsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (projectsJson) {
        this.localProjects = JSON.parse(projectsJson);
        console.log(`Loaded ${this.localProjects.length} projects from local storage`);
      } else {
        console.log('No projects found in local storage');
        this.localProjects = [];
      }
    } catch (error) {
      console.error('Error loading projects from local storage:', error);
      this.localProjects = [];
    }
  }

  /**
   * Save projects to local storage
   */
  private saveLocalProjects(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localProjects));
      console.log(`Saved ${this.localProjects.length} projects to local storage`);
    } catch (error) {
      console.error('Error saving projects to local storage:', error);
    }
  }

  /**
   * Check if Supabase is available and the projects table exists
   */
  private async checkSupabaseAvailability(): Promise<void> {
    try {
      // Check if table exists by trying to get a single row
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
      
      if (error) {
        // Table doesn't exist (code 42P01) or other Supabase error
        console.warn('Supabase error detected, using local storage fallback:', error);
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
   * Initialize and ensure access to project data
   */
  public async initializeTable(): Promise<void> {
    // Force a fresh check of Supabase availability
    await this.checkSupabaseAvailability();
    
    // If we're in fallback mode, make sure we have the latest GitHub data
    if (!this.isSupabaseAvailable) {
      console.log('Using local storage fallback mode');
      
      // If we don't have any local projects yet, try to load from GitHubService
      if (this.localProjects.length === 0) {
        try {
          // Import from GitHubService if available
          const gitHubService = await import('./GitHubService');
          if (gitHubService.REAL_PROJECTS) {
            // If we can directly access REAL_PROJECTS without calling getAllProjects (which could cause circular imports)
            this.localProjects = [...gitHubService.REAL_PROJECTS];
            this.saveLocalProjects();
            console.log(`Initialized local storage with ${this.localProjects.length} projects from REAL_PROJECTS`);
          } else if (gitHubService.GitHubService && gitHubService.GitHubService.getAllProjects) {
            const projects = await gitHubService.GitHubService.getAllProjects();
            this.localProjects = projects;
            this.saveLocalProjects();
            console.log(`Initialized local storage with ${projects.length} projects from GitHubService`);
          }
        } catch (error) {
          console.error('Failed to import projects from GitHubService:', error);
        }
      }
    }
  }

  /**
   * Get all projects from Supabase or local storage fallback
   */
  public async getAllProjects(): Promise<Agent[]> {
    // If Supabase is not available, use local storage
    if (!this.isSupabaseAvailable) {
      console.log(`Using local fallback - returning ${this.localProjects.length} projects`);
      return this.localProjects;
    }
    
    try {
      console.log('Fetching all projects from Supabase');
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*');

      if (error) {
        if (error.code === '42P01') {
          console.warn('Projects table does not exist, using local storage fallback');
          this.isSupabaseAvailable = false;
          return this.localProjects;
        }
        
        console.error('Error fetching projects from Supabase:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} projects from Supabase`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch projects from Supabase:', error);
      
      // Fall back to local storage
      console.log(`Falling back to local storage - returning ${this.localProjects.length} projects`);
      return this.localProjects;
    }
  }

  /**
   * Add a single project to Supabase or local storage fallback
   */
  public async addProject(project: Agent): Promise<boolean> {
    // If Supabase is not available, use local storage
    if (!this.isSupabaseAvailable) {
      // Check if project already exists in local storage
      if (this.localProjects.some(p => p.url === project.url)) {
        console.log('Project already exists in local storage:', project.url);
        return false;
      }
      
      // Add project to local storage
      this.localProjects.push(project);
      this.saveLocalProjects();
      console.log('Successfully added project to local storage:', project.name);
      return true;
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
        if (checkError.code === '42P01') {
          this.isSupabaseAvailable = false;
          return this.addProject(project); // Recursive call will use local storage
        }
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
        if (error.code === '42P01') {
          this.isSupabaseAvailable = false;
          return this.addProject(project); // Recursive call will use local storage
        }
        console.error('Error adding project to Supabase:', error);
        return false;
      }

      console.log('Successfully added project to Supabase:', project.name);
      return true;
    } catch (error) {
      console.error('Failed to add project to Supabase:', error);
      
      // Fall back to local storage
      return this.addProject({ ...project });
    }
  }

  /**
   * Add multiple projects to Supabase or local storage fallback
   */
  public async addProjects(projects: Agent[]): Promise<number> {
    // If Supabase is not available, use local storage
    if (!this.isSupabaseAvailable) {
      // Add projects to local storage, avoiding duplicates
      const existingUrls = new Set(this.localProjects.map(p => p.url));
      const newProjects = projects.filter(p => !existingUrls.has(p.url));
      
      if (newProjects.length === 0) {
        console.log('No new projects to add to local storage');
        return 0;
      }
      
      this.localProjects.push(...newProjects);
      this.saveLocalProjects();
      console.log(`Successfully added ${newProjects.length} projects to local storage`);
      return newProjects.length;
    }
    
    try {
      console.log(`Adding ${projects.length} projects to Supabase`);
      
      try {
        // Get existing URLs to avoid duplicates
        const { data: existingProjects, error: fetchError } = await supabase
          .from(PROJECTS_TABLE)
          .select('url');
        
        if (fetchError) {
          console.warn('Error fetching existing projects from Supabase, switching to local storage:', fetchError);
          this.isSupabaseAvailable = false;
          return this.addProjects(projects); // Recursive call will use local storage
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
              console.warn('Error adding projects chunk to Supabase, switching to local storage:', error);
              this.isSupabaseAvailable = false;
              // Add remaining projects to local storage
              const remainingProjects = newProjects.slice(i);
              return addedCount + await this.addProjects(remainingProjects);
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
      } catch (innerError) {
        console.error('Exception in Supabase operations:', innerError);
        this.isSupabaseAvailable = false;
        return this.addProjects(projects); // Recursive call will use local storage
      }
    } catch (outerError) {
      console.error('Fatal error in addProjects:', outerError);
      
      // Make sure we fall back to local storage in any case
      this.isSupabaseAvailable = false;
      return this.addProjects(projects);
    }
  }

  /**
   * Search for projects by query in Supabase or local storage fallback
   */
  public async searchProjects(query: string): Promise<Agent[]> {
    // If Supabase is not available, search in local storage
    if (!this.isSupabaseAvailable) {
      console.log('Searching projects in local storage for:', query);
      
      if (!query || query.trim() === '') {
        return this.localProjects;
      }
      
      // Split query into terms and search in local projects
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      
      const results = this.localProjects.filter(project => {
        const searchText = [
          project.name,
          project.description,
          project.language,
          project.owner,
          ...(project.topics || [])
        ].join(' ').toLowerCase();
        
        return terms.some(term => searchText.includes(term));
      });
      
      console.log(`Found ${results.length} matching projects in local storage`);
      return results;
    }
    
    try {
      console.log('Searching projects in Supabase for:', query);
      
      if (!query || query.trim() === '') {
        return this.getAllProjects();
      }
      
      // Split query into terms
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      
      // For now, we'll fetch all and filter client-side for more flexibility
      // Later, this could be optimized with Supabase text search
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*');
      
      if (error) {
        if (error.code === '42P01') {
          this.isSupabaseAvailable = false;
          return this.searchProjects(query); // Recursive call will use local storage
        }
        console.error('Error searching projects in Supabase:', error);
        throw error;
      }
      
      // Filter projects matching any search term
      const results = (data || []).filter(project => {
        const searchText = [
          project.name,
          project.description,
          project.language,
          project.owner,
          ...(project.topics || [])
        ].join(' ').toLowerCase();
        
        return terms.some(term => searchText.includes(term));
      });
      
      console.log(`Found ${results.length} matching projects in Supabase`);
      return results;
    } catch (error) {
      console.error('Failed to search projects in Supabase:', error);
      
      // Fall back to local storage search
      return this.searchProjects(query);
    }
  }
}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();
