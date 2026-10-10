import seed from '../../../data/seed.json'
import { createApp } from './app'
import { createProductRepository } from './repositories/product-repository'

// Entrada da função serverless: sem `listen` e sem simulação de rede, que é só para desenvolvimento.
export default createApp({ repository: createProductRepository(seed) })
