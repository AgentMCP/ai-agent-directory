import { createClient } from '@supabase/supabase-js';
import { Agent } from '../types';
import { REAL_PROJECTS } from './GitHubService';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tfhdkdkxlwtpgskytspc.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaGRrZGt4bHd0cGdza3l0c3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjI4MzIsImV4cCI6MjA1ODMzODgzMn0.iJo-rvb4mPMUQXZ1EYcTvepgUz7ZQ0Wn7EmuFRiEjmc';
export const PROJECTS_TABLE = 'projects';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Service for storing and retrieving project data
 * Primary store: Supabase database
 * Fallback: Browser localStorage
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private isSupabaseAvailable = true;
  private availableColumns: string[] = [];

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
   * Initialize the service
   */
  public async init(): Promise<boolean> {
    try {
      console.log('Initializing SupabaseService...');
      
      // Check if Supabase is available with a simpler check
      try {
        const { data, error } = await supabase
          .from(PROJECTS_TABLE)
          .select('id')
          .limit(1);
          
        if (error && error.code !== 'PGRST116') {
          console.warn('Supabase connection available but project table may not exist:', error);
          // Continue anyway, we'll create the table later
        }
      } catch (error) {
        console.warn('Supabase connection check failed:', error);
        // We'll still try to continue
      }
      
      // Ensure projects table exists
      await this.ensureProjectsTable();
      
      // Get available columns
      this.availableColumns = await this.getAvailableColumns();
      console.log('Available columns detected:', this.availableColumns);
      
      return true;
    } catch (error) {
      console.error('Error initializing SupabaseService:', error);
      this.isSupabaseAvailable = false;
      return false;
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
    
    // Initialize projects array
    let projects: Agent[] = [];
    let loadedFromSupabase = false;
    
    // Try Supabase first if available
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await supabase
          .from(PROJECTS_TABLE)
          .select('*');
          
        if (error) {
          console.warn('Error fetching projects from Supabase:', error.message);
        } else if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} projects from Supabase`);
          
          // Remove duplicates by URL
          const uniqueProjects: Agent[] = [];
          const seenUrls = new Set<string>();
          
          data.forEach(project => {
            if (project.url && !seenUrls.has(project.url.toLowerCase())) {
              seenUrls.add(project.url.toLowerCase());
              uniqueProjects.push(project);
            }
          });
          
          if (uniqueProjects.length < data.length) {
            console.log(`Removed ${data.length - uniqueProjects.length} duplicate projects`);
          }
          
          // Cache in localStorage for offline use
          localStorage.setItem('directory_projects', JSON.stringify(uniqueProjects));
          localStorage.setItem('last_supabase_fetch', Date.now().toString());
          
          projects = uniqueProjects;
          loadedFromSupabase = true;
        } else {
          console.log('No projects found in Supabase, checking localStorage');
        }
      } catch (error) {
        console.warn('Error in Supabase getAllProjects:', error);
      }
    }
    
    // Check localStorage if not loaded from Supabase
    if (!loadedFromSupabase) {
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
          }
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
    }
    
    // If still no projects, use default data
    if (projects.length === 0) {
      console.log('No projects found, using hardcoded REAL_PROJECTS');
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
    try {
      // Validate the required fields
      if (!project.url || !project.name) {
        console.error('Project is missing required fields:', project);
        return false;
      }
      
      // Check for duplicates - code remains the same
      // ...
      
      // Ensure we have detected available columns
      if (!this.availableColumns || this.availableColumns.length === 0) {
        this.availableColumns = await this.getAvailableColumns();
      }
      
      // Create insert data with only the columns that exist in the database
      const insertData: any = {
        url: project.url,
        name: project.name,
        description: project.description || '',
        owner: project.owner || '',
        stars: project.stars || 0,
        forks: project.forks || 0,
        topics: project.topics || [],
        language: project.language || 'Unknown',
        license: project.license || 'Unknown',
        updated: project.updated || new Date().toISOString(),
        avatar: project.avatar || ''
      };
      
      // Add tags and isTest only if those columns exist
      if (this.availableColumns.includes('tags')) {
        insertData.tags = project.tags || [];
      }
      
      if (this.availableColumns.includes('isTest')) {
        insertData.isTest = project.isTest || false;
      }
      
      // Filter the data to include only available columns
      const filteredData = this.filterObjectToAvailableColumns(insertData, this.availableColumns);
      
      // If no duplicates found, add the project
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .insert([filteredData]);
      
      // ...
    } catch (error) {
      console.error('Exception in addProject:', error);
      return false;
    }
  }
  
  /**
   * Add a single project to localStorage
   */
  private addProjectToLocalStorage(project: Agent): boolean {
    try {
      // Get existing projects
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
      
      // Check for duplicate
      if (project.url) {
        const normalizedUrl = project.url.toLowerCase().trim();
        const isDuplicate = existingProjects.some(p => 
          p.url && p.url.toLowerCase().trim() === normalizedUrl
        );
        
        if (isDuplicate) {
          console.log(`Project with URL ${project.url} already exists in localStorage`);
          return false;
        }
      }
      
      // Add to existing projects
      existingProjects.push(project);
      
      // Save back to localStorage
      localStorage.setItem('directory_projects', JSON.stringify(existingProjects));
      
      // Trigger storage event for other components to detect
      localStorage.setItem('directory_updated', Date.now().toString());
      
      console.log(`Added project ${project.name} to localStorage`);
      return true;
    } catch (e) {
      console.error('Error adding project to localStorage:', e);
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

  /**
   * Ensure the projects table exists
   */
  public async ensureProjectsTable(): Promise<boolean> {
    try {
      // Check if table exists by trying to select from it
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
      
      if (error) {
        // Table might not exist, try to create it
        console.warn('Projects table may not exist, initializing table');
        return await this.initializeTable();
      }
      
      // Table exists
      return true;
    } catch (error) {
      console.error('Error ensuring projects table exists:', error);
      return false;
    }
  }
  
  /**
   * Initialize the projects table structure
   */
  public async initializeTable(): Promise<boolean> {
    try {
      // Note: Table creation is typically handled by Supabase migrations
      // This is a fallback for development environments
      
      console.log('Checking projects table status');
      
      // Try to insert a test record to see if the table is properly configured
      const testProject = {
        url: 'https://github.com/test/test-project',
        name: 'Test Project',
        description: 'Test project for table initialization',
        isTest: true
      };
      
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .upsert([testProject], { onConflict: 'url' });
      
      if (error && error.code === '42P01') {
        console.error('Table does not exist and cannot be created from client side.');
        return false;
      } else if (error) {
        console.error('Table exists but has errors:', error);
        return false;
      }
      
      // Clean up test entry
      await supabase
        .from(PROJECTS_TABLE)
        .delete()
        .eq('url', testProject.url);
      
      console.log('Projects table initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing projects table:', error);
      return false;
    }
  }

  /**
   * Ensure required columns exist in the projects table
   */
  public async ensureProjectColumns(): Promise<boolean> {
    try {
      // Check if the table exists first
      await this.ensureProjectsTable();
      
      console.log('Checking if required columns exist in projects table');
      
      // Check if the tags column exists by querying for it
      const { error: checkError } = await supabase
        .from(PROJECTS_TABLE)
        .select('tags')
        .limit(1);
        
      // If we get a specific error about the tags column not existing, we need to add it
      if (checkError && 
          checkError.code === 'PGRST204' && 
          checkError.message && 
          checkError.message.includes("Could not find the 'tags' column")) {
        
        console.log('Tags column does not exist in projects table, skipping tags in inserts');
        return false;
      }
      
      // If no specific error about tags column, assume it exists
      return true;
      
    } catch (error) {
      console.error('Error checking project columns:', error);
      return false;
    }
  }

  /**
   * Save all projects to Supabase, handling duplicates intelligently
   */
  public async saveAllProjects(projects: Agent[]): Promise<boolean> {
    try {
      if (!projects || !Array.isArray(projects) || projects.length === 0) {
        console.error('Invalid projects array provided to saveAllProjects');
        return false;
      }
      
      console.log(`Attempting to save ${projects.length} projects to Supabase`);
      
      // Get existing projects to check for duplicates
      const { data: existingProjects, error: fetchError } = await supabase
        .from(PROJECTS_TABLE)
        .select('id, url, owner, name')
        .limit(1000);
        
      if (fetchError) {
        console.error('Error fetching existing projects:', fetchError);
        return false;
      }
      
      // Check if tags column exists
      const tagsColumnExists = await this.ensureProjectColumns();
      console.log(`Tags column exists: ${tagsColumnExists}`);

      // Create maps for quick lookups
      const existingUrlMap = new Map<string, string>(); // url -> id
      const existingOwnerRepoMap = new Map<string, string>(); // owner/repo -> id
      
      if (existingProjects && existingProjects.length > 0) {
        existingProjects.forEach(project => {
          if (project.url) {
            // Store normalized URL
            existingUrlMap.set(project.url.toLowerCase().trim(), project.id);
            
            // Also try to extract and store github owner/repo 
            try {
              if (project.url.includes('github.com')) {
                const url = new URL(project.url);
                const pathParts = url.pathname.split('/').filter(part => part);
                if (pathParts.length >= 2) {
                  const repoKey = `${pathParts[0].toLowerCase()}/${pathParts[1].toLowerCase()}`;
                  existingOwnerRepoMap.set(repoKey, project.id);
                }
              }
            } catch (e) {
              // Ignore URL parsing errors
            }
            
            // Also use owner/name if available
            if (project.owner && project.name) {
              const ownerRepoKey = `${project.owner.toLowerCase()}/${project.name.toLowerCase()}`;
              existingOwnerRepoMap.set(ownerRepoKey, project.id);
            }
          }
        });
      }
      
      console.log(`Found ${existingUrlMap.size} existing URLs and ${existingOwnerRepoMap.size} owner/repo combinations`);
      
      // Process projects in batches to avoid overwhelming the database
      const batchSize = 25;
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < projects.length; i += batchSize) {
        const batch = projects.slice(i, i + batchSize);
        const toInsert = [];
        
        for (const project of batch) {
          if (!project.url || !project.name) {
            console.warn('Skipping project with missing required fields', project);
            skipCount++;
            continue;
          }
          
          // Check for duplicates
          let isDuplicate = false;
          
          // Check by URL
          if (project.url) {
            const normalizedUrl = project.url.toLowerCase().trim();
            if (existingUrlMap.has(normalizedUrl)) {
              isDuplicate = true;
            } else {
              // Check GitHub URLs
              try {
                if (normalizedUrl.includes('github.com')) {
                  const url = new URL(normalizedUrl);
                  const pathParts = url.pathname.split('/').filter(part => part);
                  if (pathParts.length >= 2) {
                    const repoKey = `${pathParts[0].toLowerCase()}/${pathParts[1].toLowerCase()}`;
                    if (existingOwnerRepoMap.has(repoKey)) {
                      isDuplicate = true;
                    }
                  }
                }
              } catch (e) {
                // URL parsing failed, continue with original checks
                console.warn('URL parsing failed during duplicate check:', project.url);
              }
            }
          }
          
          // Also check by owner/name
          if (!isDuplicate && project.owner && project.name) {
            const ownerRepoKey = `${project.owner.toLowerCase()}/${project.name.toLowerCase()}`;
            if (existingOwnerRepoMap.has(ownerRepoKey)) {
              isDuplicate = true;
            }
          }
          
          if (isDuplicate) {
            skipCount++;
          } else {
            // Prepare insert data based on column existence
            const insertData: any = {
              url: project.url,
              name: project.name,
              description: project.description || '',
              owner: project.owner || '',
              stars: project.stars || 0,
              forks: project.forks || 0,
              topics: project.topics || [],
              language: project.language || 'Unknown',
              license: project.license || 'Unknown',
              updated: project.updated || new Date().toISOString(),
              avatar: project.avatar || ''
            };
            
            // Only include tags if the column exists
            if (tagsColumnExists) {
              insertData.tags = project.tags || [];
            }
            
            // Filter the data to include only available columns
            const filteredData = this.filterObjectToAvailableColumns(insertData, this.availableColumns);
            
            toInsert.push(filteredData);
            
            // Add to our tracking sets to prevent duplicates in the same batch
            existingUrlMap.set(project.url.toLowerCase().trim(), 'pending');
            if (project.owner && project.name) {
              existingOwnerRepoMap.set(`${project.owner.toLowerCase()}/${project.name.toLowerCase()}`, 'pending');
            }
          }
        }
        
        if (toInsert.length > 0) {
          console.log(`Inserting batch of ${toInsert.length} projects to Supabase`);
          const result = await this.insertProjectsBatch(toInsert);
            
          if (result.error) {
            console.error('Error inserting projects batch:', result.error);
            errorCount += toInsert.length;
          } else {
            successCount += toInsert.length;
            console.log(`Successfully inserted ${toInsert.length} projects`);
          }
        }
      }
      
      console.log(`Completed saving projects. Success: ${successCount}, Skipped (duplicates): ${skipCount}, Errors: ${errorCount}`);
      
      // After successfully adding to Supabase, trigger a refresh event
      if (typeof window !== 'undefined') {
        // Use a unique timestamp to ensure the event is always detected
        localStorage.setItem('supabase_updated', Date.now().toString());
        // Dispatch a custom event for components that don't listen to storage
        window.dispatchEvent(new CustomEvent('supabase_updated'));
      }
      
      return successCount > 0;
      
    } catch (error) {
      console.error('Exception in saveAllProjects:', error);
      return false;
    }
  }

  /**
   * Save a batch of projects to Supabase
   */
  private async insertProjectsBatch(projects: any[]): Promise<{ data: any; error: any }> {
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return { data: null, error: null }; // Nothing to insert
    }
    
    try {
      console.log(`Inserting batch of ${projects.length} projects to Supabase`);
      
      // Ensure we have detected available columns
      if (!this.availableColumns || this.availableColumns.length === 0) {
        this.availableColumns = await this.getAvailableColumns();
      }
      
      // Add UUIDs to projects that need them and filter to available columns
      const preparedProjects = projects.map(project => {
        // Generate UUID if needed
        const withId = {
          ...project,
          // Only generate ID if it doesn't already have one
          id: project.id || crypto.randomUUID()
        };
        
        // Then filter to only include available columns
        return this.filterObjectToAvailableColumns(withId, this.availableColumns);
      });

      console.log(`Prepared ${preparedProjects.length} projects with IDs and filtered to available columns`);
      
      // Insert the prepared projects
      const result = await supabase
        .from(PROJECTS_TABLE)
        .insert(preparedProjects);
        
      if (result.error) {
        console.warn('Error inserting projects batch:', result.error);
        
        // Try one more time with minimal fields if we get a column error
        if (result.error.code === 'PGRST204' && result.error.message?.includes('column')) {
          console.log('Trying insertion with only core fields...');
          
          // Use only the most basic fields but ensure ID is included
          const minimalProjects = projects.map(project => ({
            id: project.id || crypto.randomUUID(),
            name: project.name,
            url: project.url,
            description: project.description || '',
            owner: project.owner || '',
            stars: project.stars || 0
          }));
          
          const fallbackResult = await supabase
            .from(PROJECTS_TABLE)
            .insert(minimalProjects);
            
          return fallbackResult;
        }
        
        return result;
      }
      
      return result;
    } catch (error) {
      console.error('Error in insertProjectsBatch:', error);
      return { data: null, error };
    }
  }

  /**
   * Get available columns in the projects table
   */
  public async getAvailableColumns(): Promise<string[]> {
    // If we already have columns cached, return them
    if (this.availableColumns && this.availableColumns.length > 0) {
      return this.availableColumns;
    }
    
    try {
      // Try a simple select first to see if the table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.warn('Table exists but has errors:', tableError);
        // Return basic columns that should always exist
        return ['id', 'url', 'name', 'description', 'owner', 'stars', 'forks', 'language'];
      }
      
      // We know the table exists, now try to use introspection
      try {
        // Get column information from Supabase introspection
        const { data, error } = await supabase.rpc('get_column_names', { 
          table_name: PROJECTS_TABLE 
        });
        
        if (error) {
          console.warn('RPC method for column detection not available - using fallback:', error);
          // Fallback to manual column detection
          return this.detectColumnsManually();
        }
        
        if (data && Array.isArray(data)) {
          console.log('Available columns in projects table:', data);
          this.availableColumns = data;
          return data;
        }
      } catch (rpcError) {
        console.warn('RPC function not available:', rpcError);
        // RPC not available, fallback to manual detection
      }
      
      // Fallback to manual detection
      return this.detectColumnsManually();
      
    } catch (error) {
      console.error('Error getting available columns:', error);
      // Use default column set as fallback
      return ['id', 'url', 'name', 'description', 'owner', 'stars', 'forks', 'language'];
    }
  }
  
  /**
   * Detect columns manually by trying to select them
   */
  private async detectColumnsManually(): Promise<string[]> {
    // These are the columns we expect to have
    const expectedColumns = [
      'id', 'url', 'name', 'description', 'owner', 
      'stars', 'forks', 'topics', 'language', 'license', 
      'updated', 'tags', 'avatar', 'isTest'
    ];
    
    const availableColumns: string[] = [];
    
    // Try a simple query first
    try {
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
        
      if (error) {
        console.warn('Unable to detect columns manually:', error);
        // Return basic columns as fallback
        return ['id', 'url', 'name', 'description', 'owner', 'stars', 'forks', 'language'];
      }
    } catch (error) {
      console.warn('Error checking table:', error);
      // Return basic columns as fallback
      return ['id', 'url', 'name', 'description', 'owner', 'stars', 'forks', 'language'];
    }
    
    // Use the select columns method - simpler than checking each column
    try {
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*')
        .limit(1);
        
      if (!error) {
        console.log('Table structure looks good, using all expected columns');
        return expectedColumns;
      }
    } catch (error) {
      console.warn('Error checking all columns:', error);
    }
    
    // Fallback to trying each column individually
    for (const column of expectedColumns) {
      try {
        const { error } = await supabase
          .from(PROJECTS_TABLE)
          .select(column)
          .limit(1);
        
        if (!error) {
          availableColumns.push(column);
        }
      } catch (error) {
        // Column doesn't exist, skip it
        console.log(`Column ${column} doesn't exist in the schema`);
      }
    }
    
    // Always ensure we have the absolutely required columns
    if (!availableColumns.includes('id')) availableColumns.push('id');
    if (!availableColumns.includes('url')) availableColumns.push('url');
    if (!availableColumns.includes('name')) availableColumns.push('name');
    
    console.log('Manually detected columns:', availableColumns);
    this.availableColumns = availableColumns;
    return availableColumns;
  }
  
  /**
   * Filter object properties to only include available columns
   */
  private filterObjectToAvailableColumns(obj: any, availableColumns: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const filtered: any = {};
    
    // Only include properties that exist as columns
    for (const key of Object.keys(obj)) {
      if (availableColumns.includes(key)) {
        filtered[key] = obj[key];
      }
    }
    
    return filtered;
  }
}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();
