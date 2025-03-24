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
 * Service for storing and retrieving project data
 * Primary store: Supabase database
 * Fallback: Browser localStorage
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private isSupabaseAvailable = true;

  // Singleton pattern to ensure consistency across the application
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  constructor() {
    // Check if Supabase is available by making a test query
    this.checkSupabaseAvailability();
  }

  /**
   * Check if Supabase is available by querying the projects table
   */
  private async checkSupabaseAvailability() {
    try {
      const { error } = await supabase.from(PROJECTS_TABLE).select('id').limit(1);
      
      if (error) {
        console.warn('Supabase unavailable, will use localStorage:', error.message);
        this.isSupabaseAvailable = false;
      } else {
        console.log('Supabase connection successful');
        this.isSupabaseAvailable = true;
      }
    } catch (error) {
      console.warn('Error checking Supabase availability:', error);
      this.isSupabaseAvailable = false;
    }
  }

  /**
   * Add multiple projects to the database
   * First tries Supabase, falls back to localStorage if needed
   */
  public async addProjects(projects: Agent[]): Promise<number> {
    // Try Supabase first if available
    if (this.isSupabaseAvailable) {
      try {
        // First get existing projects to avoid duplicates
        const { data: existingProjects, error: fetchError } = await supabase
          .from(PROJECTS_TABLE)
          .select('url');
          
        if (fetchError) {
          console.warn('Error fetching existing projects from Supabase:', fetchError.message);
          return this.saveProjectsToLocalStorage(projects);
        }
        
        // Create a set of existing URLs for faster lookup
        const existingUrls = new Set<string>();
        existingProjects?.forEach(project => {
          if (project.url) {
            existingUrls.add(project.url);
          }
        });
        
        // Filter out projects that already exist in the database
        const newProjects = projects.filter(project => 
          project.url && !existingUrls.has(project.url)
        );
        
        console.log(`Found ${existingUrls.size} existing projects in Supabase, adding ${newProjects.length} new ones`);
        
        if (newProjects.length === 0) {
          console.log('No new projects to add to Supabase');
          return 0;
        }
        
        // Insert new projects into Supabase
        const { error: insertError } = await supabase
          .from(PROJECTS_TABLE)
          .insert(newProjects);
          
        if (insertError) {
          console.warn('Error inserting projects into Supabase:', insertError.message);
          return this.saveProjectsToLocalStorage(projects);
        }
        
        // Also update localStorage as a cache
        this.saveProjectsToLocalStorage(projects);
        
        return newProjects.length;
      } catch (error) {
        console.warn('Error in Supabase addProjects:', error);
        return this.saveProjectsToLocalStorage(projects);
      }
    } else {
      // Fallback to localStorage
      return this.saveProjectsToLocalStorage(projects);
    }
  }
  
  /**
   * Save projects to localStorage and return the number added
   * Used as a fallback and for caching
   */
  private saveProjectsToLocalStorage(newProjects: Agent[]): number {
    try {
      // Get existing projects from localStorage
      const existingProjectsJson = localStorage.getItem('directory_projects');
      let existingProjects: Agent[] = [];
      
      if (existingProjectsJson) {
        try {
          existingProjects = JSON.parse(existingProjectsJson);
          if (!Array.isArray(existingProjects)) {
            existingProjects = [];
          }
        } catch (e) {
          console.error('Error parsing localStorage projects:', e);
          existingProjects = [];
        }
      }
      
      console.log(`Found ${existingProjects.length} existing projects in localStorage`);
      
      // Create a map of URLs to avoid duplicates
      const projectMap = new Map<string, Agent>();
      
      // Add existing projects to map
      existingProjects.forEach(project => {
        if (project.url) {
          projectMap.set(project.url, project);
        }
      });
      
      // Count how many new unique projects we're adding
      let newUniqueCount = 0;
      
      // Add new projects to map (will overwrite existing ones with same URL)
      newProjects.forEach(project => {
        if (project.url) {
          // If this is a new URL we haven't seen before, increment counter
          if (!projectMap.has(project.url)) {
            newUniqueCount++;
          }
          projectMap.set(project.url, project);
        }
      });
      
      // Convert map back to array
      const mergedProjects = Array.from(projectMap.values());
      
      // Save back to localStorage
      localStorage.setItem('directory_projects', JSON.stringify(mergedProjects));
      console.log(`Saved ${mergedProjects.length} total projects to localStorage (${newUniqueCount} new unique projects)`);
      
      // Trigger storage event for other components to detect
      localStorage.setItem('directory_updated', Date.now().toString());
      
      // Return number of new unique projects added
      return newUniqueCount;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return 0;
    }
  }
  
  /**
   * Get all projects, first trying Supabase then falling back to localStorage
   */
  public async getAllProjects(): Promise<Agent[]> {
    console.log('SupabaseService: Getting all projects from database');
    
    let projects: Agent[] = [];
    let shouldUseFallback = false;
    
    // Try Supabase first if available
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await supabase
          .from(PROJECTS_TABLE)
          .select('*');
          
        if (error) {
          console.warn('Error fetching projects from Supabase:', error.message);
          shouldUseFallback = true;
        } else if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} projects from Supabase`);
          
          // Cache in localStorage for offline use
          localStorage.setItem('directory_projects', JSON.stringify(data));
          
          // Return the Supabase data directly
          return data;
        } else {
          console.log('No projects found in Supabase, checking localStorage');
          shouldUseFallback = true;
        }
      } catch (error) {
        console.warn('Error in Supabase getAllProjects:', error);
        shouldUseFallback = true;
      }
    } else {
      shouldUseFallback = true;
    }
    
    // Fallback to localStorage if needed
    if (shouldUseFallback) {
      try {
        const localData = localStorage.getItem('directory_projects');
        if (localData) {
          const localProjects = JSON.parse(localData);
          if (Array.isArray(localProjects) && localProjects.length > 0) {
            console.log(`Using ${localProjects.length} projects from localStorage`);
            projects = localProjects;
            
            // If we found data in localStorage but not in Supabase, try to sync it back to Supabase
            if (this.isSupabaseAvailable && projects.length > 0) {
              console.log('Syncing localStorage data back to Supabase');
              this.syncLocalStorageToSupabase(projects);
            }
            
            return projects;
          }
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      
      // Final fallback to hardcoded projects
      console.log('No projects in localStorage, using hardcoded REAL_PROJECTS');
      projects = REAL_PROJECTS;
      
      // Save to Supabase and localStorage
      this.bootstrapDefaultData();
    }
    
    return projects;
  }

  /**
   * Sync localStorage data back to Supabase
   * This helps recover from scenarios where data is in localStorage but not in Supabase
   */
  private async syncLocalStorageToSupabase(projects: Agent[]): Promise<void> {
    if (!this.isSupabaseAvailable || !projects.length) return;
    
    try {
      // First get what's already in Supabase to avoid duplicates
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('url');
        
      if (error) {
        console.warn('Error checking existing Supabase entries:', error.message);
        return;
      }
      
      // Create a set of existing URLs for quick lookup
      const existingUrls = new Set(data?.map(item => item.url?.toLowerCase() || '') || []);
      
      // Filter to only projects that don't exist in Supabase
      const newProjects = projects.filter(project => 
        project.url && !existingUrls.has(project.url.toLowerCase())
      );
      
      if (newProjects.length === 0) {
        console.log('No new projects to sync to Supabase');
        return;
      }
      
      // Insert the new projects
      const { error: insertError } = await supabase
        .from(PROJECTS_TABLE)
        .insert(newProjects);
        
      if (insertError) {
        console.warn('Error syncing projects to Supabase:', insertError.message);
      } else {
        console.log(`Successfully synced ${newProjects.length} projects to Supabase`);
      }
    } catch (error) {
      console.warn('Error in syncLocalStorageToSupabase:', error);
    }
  }

  /**
   * Bootstrap the database with default data if it's empty
   */
  private async bootstrapDefaultData(): Promise<void> {
    // Save to localStorage
    this.saveProjectsToLocalStorage(REAL_PROJECTS);
    
    // If Supabase is available, also save there
    if (this.isSupabaseAvailable) {
      try {
        // First check if there's already data in Supabase
        const { data, error: checkError } = await supabase
          .from(PROJECTS_TABLE)
          .select('id')
          .limit(1);
          
        if (checkError) {
          console.warn('Error checking if Supabase has data:', checkError.message);
        } else if (!data || data.length === 0) {
          // Only populate if there's no data
          console.log('Populating Supabase with default projects');
          const { error } = await supabase
            .from(PROJECTS_TABLE)
            .insert(REAL_PROJECTS);
            
          if (error) {
            console.warn('Error populating Supabase with default projects:', error.message);
          } else {
            console.log('Successfully populated Supabase with default projects');
          }
        } else {
          console.log('Supabase already has data, not populating with defaults');
        }
      } catch (error) {
        console.warn('Error in bootstrapDefaultData:', error);
      }
    }
  }

  /**
   * Add a single project to the database
   */
  public async addProject(project: Agent): Promise<boolean> {
    console.log('Adding project to Supabase:', project.url);
    
    try {
      // First check if this URL already exists in our database
      const existingProjects = await this.getAllProjects();
      const isDuplicate = existingProjects.some(p => 
        p.url && p.url.toLowerCase() === project.url.toLowerCase()
      );
      
      if (isDuplicate) {
        console.warn(`Project with URL ${project.url} already exists in the database`);
        return false;
      }
      
      // Try Supabase first if available
      if (this.isSupabaseAvailable) {
        try {
          // Double-check if project already exists by URL
          const { data, error: checkError } = await supabase
            .from(PROJECTS_TABLE)
            .select('id')
            .ilike('url', project.url)
            .limit(1);
            
          if (checkError) {
            console.warn('Error checking for existing project in Supabase:', checkError.message);
          } else if (data && data.length > 0) {
            console.log('Project already exists in Supabase');
            return false;
          }
          
          // Insert the new project
          const { error: insertError } = await supabase
            .from(PROJECTS_TABLE)
            .insert([project]);
            
          if (insertError) {
            console.warn('Error inserting project into Supabase:', insertError.message);
            
            // If Supabase gives a unique violation error, it's a duplicate
            if (insertError.code === '23505') { // Postgres unique violation code
              console.log('Duplicate detected by Supabase constraint');
              return false;
            }
          } else {
            console.log('Successfully added project to Supabase');
            
            // Also update localStorage
            this.addProjectToLocalStorage(project);
            return true;
          }
        } catch (error) {
          console.warn('Error in Supabase addProject:', error);
        }
      }
      
      // Fallback to localStorage
      return this.addProjectToLocalStorage(project);
    } catch (error) {
      console.error('Error in project addition process:', error);
      return false;
    }
  }
  
  /**
   * Add a single project to localStorage
   */
  private addProjectToLocalStorage(project: Agent): boolean {
    try {
      // Check if the project already exists
      const existingProjectsJson = localStorage.getItem('directory_projects');
      let existingProjects: Agent[] = [];
      
      if (existingProjectsJson) {
        try {
          existingProjects = JSON.parse(existingProjectsJson);
          if (!Array.isArray(existingProjects)) {
            existingProjects = [];
          }
        } catch (e) {
          console.error('Error parsing localStorage projects:', e);
          existingProjects = [];
        }
      }
      
      // Check if project already exists in localStorage
      const existingProject = existingProjects.find(p => p.url === project.url);
      
      if (existingProject) {
        console.log('Project already exists in localStorage');
        return false;
      }
      
      // Add project to localStorage
      const newProjects = [...existingProjects, project];
      localStorage.setItem('directory_projects', JSON.stringify(newProjects));
      console.log('Added project to localStorage');
      
      // Trigger storage event for other components to detect
      localStorage.setItem('directory_updated', Date.now().toString());
      
      return true;
    } catch (error) {
      console.log('Error in project addition process');
      return false;
    }
  }

  /**
   * Search for projects by query
   */
  public async searchProjects(query: string): Promise<Agent[]> {
    // Try Supabase first if available
    if (this.isSupabaseAvailable) {
      try {
        if (!query || query.trim() === '') {
          // Get all projects if no query
          return this.getAllProjects();
        }
        
        // Normalize query
        const normalizedQuery = query.toLowerCase().trim();
        
        // Search in Supabase using ILIKE for text fields
        // Note: This is a simplified search that only checks name, description, and language
        // For more complex searches, you might want to implement a dedicated search feature in Supabase
        const { data, error } = await supabase
          .from(PROJECTS_TABLE)
          .select('*')
          .or(`name.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,language.ilike.%${normalizedQuery}%,owner.ilike.%${normalizedQuery}%`);
          
        if (error) {
          console.warn('Error searching projects in Supabase:', error.message);
        } else if (data && data.length > 0) {
          console.log(`Found ${data.length} matching projects in Supabase`);
          return data;
        } else {
          console.log('No matching projects found in Supabase');
        }
      } catch (error) {
        console.warn('Error in Supabase searchProjects:', error);
      }
    }
    
    // Fallback to localStorage search
    try {
      // Get all projects from localStorage
      const localData = localStorage.getItem('directory_projects');
      let projects: Agent[] = [];
      
      if (localData) {
        projects = JSON.parse(localData);
        if (!Array.isArray(projects)) {
          projects = REAL_PROJECTS;
        }
      } else {
        projects = REAL_PROJECTS;
      }
      
      if (!query || query.trim() === '') {
        return projects;
      }
      
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // Filter projects
      const results = projects.filter(project => {
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
          topics.some(topic => typeof topic === 'string' && topic.toLowerCase().includes(normalizedQuery))
        );
      });
      
      console.log(`Found ${results.length} matching projects in localStorage`);
      return results;
    } catch (e) {
      console.error('Error searching projects in localStorage:', e);
      return REAL_PROJECTS;
    }
  }
}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();
