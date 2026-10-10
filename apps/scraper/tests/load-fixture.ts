import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const loadFixture = (name: string) =>
  readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8')
