import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@styles/index.css'

// Get app info from environment variables
const appName = import.meta.env.VITE_APP_NAME || 'Weather App';
document.title = appName;

createRoot(document.getElementById('root')).render(
  // Remove StrictMode in production to prevent double renders and API calls
  import.meta.env.PROD ? <App /> : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
