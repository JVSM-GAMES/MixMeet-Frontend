// MixMeet-Frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configurações do servidor de desenvolvimento
  server: {
    port: 5173, // Garantir que ele use a porta correta
    host: 'localhost',
  },
  // Base URL (Geralmente não é necessário mudar para o projeto local, mas garante que o roteamento comece no root)
  base: '/', 
})