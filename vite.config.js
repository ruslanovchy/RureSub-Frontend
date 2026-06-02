import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['ruresub.loca.lt'], 
    
    hmr: {
      host: 'ruresub.loca.lt',
      protocol: 'wss',         
      clientPort: 443          
    }
  }
})
