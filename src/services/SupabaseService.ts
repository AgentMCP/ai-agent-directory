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
 * Creates the projects table if it doesn't exist
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private isTableCreated: boolean = false;

  // Singleton pattern to ensure consistency across the application
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private constructor() {
    console.log('SupabaseService initialized');
    this.initializeTable();
  }

  /**
   * Create the projects table if it doesn't exist
   */
  private async createProjectsTable(): Promise<void> {
    try {
      console.log('Creating projects table in Supabase...');
      
      // Create the table using Supabase SQL
      const { error } = await supabase.rpc('create_projects_table');
      
      if (error) {
        console.error('Error creating projects table:', error);
        
        // Try an alternative approach with direct SQL
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS ${PROJECTS_TABLE} (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              stars INTEGER,
              forks INTEGER,
              url TEXT UNIQUE NOT NULL,
              owner TEXT,
              avatar TEXT,
              language TEXT,
              updated TEXT,
              topics JSONB,
              license TEXT
            );
          `
        });
        
        if (sqlError) {
          console.error('Error executing SQL to create table:', sqlError);
          throw sqlError;
        }
      }
      
      this.isTableCreated = true;
      console.log('Successfully created projects table in Supabase');
    } catch (error) {
      console.error('Failed to create projects table:', error);
      throw error;
    }
  }

  /**
   * Check if Supabase projects table exists
   */
  private async checkTableExists(): Promise<boolean> {
    try {
      // Check if table exists by trying to get a single row
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.warn('Projects table does not exist in Supabase');
        return false;
      }
      
      return !error;
    } catch (error) {
      console.error('Failed to check if table exists:', error);
      return false;
    }
  }

  /**
   * Initialize and ensure access to project data
   */
  public async initializeTable(): Promise<void> {
    try {
      // Check if table exists
      const tableExists = await this.checkTableExists();
      
      if (!tableExists) {
        // Create the table
        await this.createProjectsTable();
        
        // Seed with initial data if needed
        const initialProjects = REAL_PROJECTS || [];
        if (initialProjects.length > 0) {
          await this.addProjects(initialProjects);
          console.log(`Seeded projects table with ${initialProjects.length} initial projects`);
        }
      } else {
        console.log('Projects table already exists in Supabase');
        this.isTableCreated = true;
      }
    } catch (error) {
      console.error('Failed to initialize table:', error);
    }
  }

  /**
   * Get all projects from Supabase
   */
  public async getAllProjects(): Promise<Agent[]> {
    try {
      console.log('Fetching all projects from Supabase');
      
      // Make sure table exists first
      if (!this.isTableCreated) {
        await this.initializeTable();
      }
      
      const { data, error } = await supabase
        .from(PROJECTS_TABLE)
        .select('*');

      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        return [];
      }

      console.log(`Fetched ${data?.length || 0} projects from Supabase`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch projects from Supabase:', error);
      return [];
    }
  }

  /**
   * Add a single project to Supabase
   */
  public async addProject(project: Agent): Promise<boolean> {
    try {
      console.log('Adding project to Supabase:', project.name);
      
      // Make sure table exists first
      if (!this.isTableCreated) {
        await this.initializeTable();
      }
      
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
    try {
      console.log(`Adding ${projects.length} projects to Supabase`);
      
      // Make sure table exists first
      if (!this.isTableCreated) {
        await this.initializeTable();
      }
      
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
   * Search for projects by query in Supabase
   */
  public async searchProjects(query: string): Promise<Agent[]> {
    try {
      console.log(`Searching for projects with query: "${query}"`);
      
      // Make sure table exists first
      if (!this.isTableCreated) {
        await this.initializeTable();
      }
      
      if (!query || query.trim() === '') {
        return this.getAllProjects();
      }
      
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // Get all projects and filter on client side
      // This is a workaround since Supabase might not support full text search in all plans
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
      return [];
    }
  }
}

// Export a singleton instance
export const supabaseService = SupabaseService.getInstance();
