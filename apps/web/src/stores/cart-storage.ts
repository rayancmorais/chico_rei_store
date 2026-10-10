import type { Color } from '@chico_rei_store/shared'
import type { CartItem } from './cart'

// A versão na chave deixa mudar o formato do item no futuro sem ler dados no formato antigo.
export const CART_STORAGE_KEY = 'penca-store:cart:v1'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function isColor(value: unknown): value is Color {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.hex === 'string'
  )
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    typeof value.productId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.image === 'string' &&
    Number.isInteger(value.unitPriceCents) &&
    (value.unitPriceCents as number) >= 0 &&
    isColor(value.color) &&
    (typeof value.size === 'string' || value.size === null) &&
    Number.isInteger(value.quantity) &&
    (value.quantity as number) >= 1
  )
}

/**
 * O localStorage é entrada externa: pode ter sido editado à mão ou vir de outra versão do app.
 * Item inválido é descartado em vez de quebrar o carrinho inteiro.
 */
export function parseCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    return Array.isArray(data) ? data.filter(isCartItem) : []
  } catch {
    return []
  }
}

// Em aba anônima ou com o armazenamento cheio, o localStorage lança erro. O carrinho continua
// funcionando em memória; só não sobrevive ao recarregamento.
export function loadCart(): CartItem[] {
  try {
    return parseCart(localStorage.getItem(CART_STORAGE_KEY))
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Sem onde salvar: segue só em memória (ver loadCart).
  }
}
