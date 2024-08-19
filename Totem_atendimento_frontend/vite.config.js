import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Permite conexões externas
    port: 8000,       // Porta onde o servidor Vite será executado
  },
});
