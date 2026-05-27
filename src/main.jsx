import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
)
