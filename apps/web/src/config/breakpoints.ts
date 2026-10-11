// O tailwind.config.ts lê os breakpoints daqui: assim as classes `md:`/`lg:` e as media queries
// escritas no código (matchMedia, <source media>, sizes das imagens) não podem divergir.
export const BREAKPOINTS = { md: 768, lg: 1024 } as const

type Breakpoint = keyof typeof BREAKPOINTS

export const mediaFrom = (breakpoint: Breakpoint) => `(min-width: ${BREAKPOINTS[breakpoint]}px)`
export const mediaBelow = (breakpoint: Breakpoint) =>
  `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`
