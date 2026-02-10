import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "capture-elder-concerned-animals.trycloudflare.com",
      "diamonds-trips-infectious-resume.trycloudflare.com",
    ],
  },
})
