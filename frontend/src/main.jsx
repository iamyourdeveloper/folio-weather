import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@styles/index.css'
import { APP_NAME } from '@/constants/appInfo.js'

document.title = APP_NAME;

createRoot(document.getElementById('root')).render(
  // Remove StrictMode in production to prevent double renders and API calls
  import.meta.env.PROD ? <App /> : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
