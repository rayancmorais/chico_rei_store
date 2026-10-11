const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const amount = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(cents: number) {
  return brl.format(cents / 100)
}

/** Só o valor, sem o "R$" ("72,90"), para quando o símbolo tem estilo próprio. */
export function formatPriceAmount(cents: number) {
  return amount.format(cents / 100)
}

/** "1 produto", "3 produtos". */
export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

// Os tipos da loja são substantivos simples: vogal final ganha "s" ("Camisetas") e "m" vira "ns"
// ("Moletons"). O resto fica como está ("Kit de Imãs", "Ecobag"), o que ainda lê bem num título.
export function pluralTypeLabel(label: string) {
  if (/[aeiou]$/i.test(label)) return `${label}s`
  if (/m$/i.test(label)) return `${label.slice(0, -1)}ns`
  return label
}
