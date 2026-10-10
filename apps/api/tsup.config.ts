import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts', 'src/handler.ts'],
  format: ['esm'],
  target: 'node24',
  clean: true,
  noExternal: ['@chico_rei_store/shared'],
})
