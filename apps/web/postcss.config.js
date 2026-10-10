import { fileURLToPath } from 'node:url'

// Caminho explícito: os testes rodam a partir da raiz do monorepo, onde não há tailwind.config.
export default {
  plugins: {
    tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.ts', import.meta.url)) },
    autoprefixer: {},
  },
}
