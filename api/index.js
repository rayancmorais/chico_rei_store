// A Vercel transforma cada arquivo de api/ numa função, mas não resolve os imports sem extensão do
// código TypeScript da API. O tsup gera um bundle no build e este arquivo só o reexporta.
export { default } from '../apps/api/dist/handler.js'
