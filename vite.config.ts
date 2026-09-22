import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 7457,
		origin: 'http://localhost:7457',
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [react()]
})
