import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base:'/React_resume',
  plugins: [react()],
  server: {
    // Include the exact domain displayed in the error message or you could wildcard ngrok domains.
    allowedHosts: ['3943-5-187-1-140.ngrok-free.app'],
  },
})
