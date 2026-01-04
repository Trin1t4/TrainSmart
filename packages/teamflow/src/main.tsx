import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initAllServices } from '@trainsmart/shared';
import { supabase } from './lib/supabaseClient';

// Initialize all services centrally
initAllServices(supabase);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
