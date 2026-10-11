// Mesma regra de uma linha do front, copiada de propósito: os apps não importam código uns dos
// outros, e trazer pelo `shared` levaria o Zod junto para o bundle da loja.
export const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`
