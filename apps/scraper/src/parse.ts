const INITIAL_DATA_MARKER = 'window.vueInitialData'

/**
 * Necessário porque o mesmo <script> tem mais JavaScript depois do JSON.
 * Chaves dentro de strings (ex.: nome de produto com "{") são ignoradas.
 */
function sliceJsonObject(text: string, start: number): string {
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const char = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  throw new Error('JSON de vueInitialData não foi fechado')
}

export function extractInitialData(html: string): unknown {
  const markerIndex = html.indexOf(INITIAL_DATA_MARKER)
  if (markerIndex === -1) throw new Error('vueInitialData não encontrado na página')
  const jsonStart = html.indexOf('{', markerIndex)
  return JSON.parse(sliceJsonObject(html, jsonStart))
}
