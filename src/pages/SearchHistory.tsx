import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSearches } from '../services/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Agent } from '../types';

interface SearchRecord {
  id: string;
  userId: string;
  searchQuery: string;
  timestamp: { seconds: number; nanoseconds: number };
  repositoryCount: number;
  repositories: Agent[];
}

const SearchHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchSearches = async () => {
      try {
        setLoading(true);
        const userSearches = await getUserSearches(currentUser.uid);
        setSearches(userSearches);
      } catch (error) {
        console.error('Error fetching searches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearches();
  }, [currentUser, navigate]);

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return format(new Date(timestamp.seconds * 1000), 'PPpp');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Search History</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : searches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-500">You haven't performed any searches yet.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searches.map((search) => (
            <Card key={search.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{search.searchQuery || 'AI Agent MCP'}</CardTitle>
                <CardDescription>{formatDate(search.timestamp)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-500 mb-4">
                  Found {search.repositoryCount} repositories
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {search.repositories.slice(0, 5).map((repo, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded-md flex justify-between items-center">
                      <span className="font-medium truncate">{repo.name}</span>
                      {repo.url && (
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Link className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                  {search.repositories.length > 5 && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      + {search.repositories.length - 5} more
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Implement re-import functionality
                    localStorage.setItem('reimport_repositories', JSON.stringify(search.repositories));
                    navigate('/');
                  }}
                >
                  Re-import these repositories
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
