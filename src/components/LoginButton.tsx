import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';

const LoginButton: React.FC = () => {
  const { currentUser, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signIn();
      toast({
        title: 'Signed in successfully',
        description: 'You are now signed in with Google.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: 'There was an error signing in with Google.',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign out failed',
        description: 'There was an error signing out.',
      });
    }
  };

  const viewSearchHistory = () => {
    navigate('/search-history');
  };

  if (!currentUser) {
    return (
      <Button variant="outline" onClick={handleSignIn} className="flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          {currentUser.displayName || currentUser.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={viewSearchHistory}>
          Search History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LoginButton;
