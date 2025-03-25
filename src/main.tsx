import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { SupabaseService } from './services/SupabaseService';

// Initialize Supabase Service
SupabaseService.getInstance().init().then(success => {
  console.log('Supabase initialization:', success ? 'successful' : 'failed');
}).catch(error => {
  console.error('Error initializing Supabase:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
