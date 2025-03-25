export interface Agent {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  url: string;
  owner: string;
  avatar: string;
  language: string;
  updated: string;
  topics: string[];
  license: string;
  tags?: string[];
  isLoading?: boolean;
}

export type SortOption = 'stars' | 'updated' | 'forks';

export interface FilterOptions {
  language: string | null;
  license: string | null;
  sort: SortOption;
  searchQuery: string;
}

export interface ProjectSubmissionResponse {
  success: boolean;
  error?: string;
  agent?: Agent;
}
