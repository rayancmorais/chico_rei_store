const MARKER = 'window.vueInitialData'

export function extractInitialData(html: string): unknown {
  const start = html.indexOf(MARKER)
  if (start === -1) throw new Error('vueInitialData não encontrado na página')
  const jsonStart = html.indexOf('{', start)
  const scriptEnd = html.indexOf('</script>', jsonStart)
  return JSON.parse(html.slice(jsonStart, scriptEnd).trim().replace(/;$/, ''))
}

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
