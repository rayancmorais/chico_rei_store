import { createServerApp } from './start-server'

// Entrada da função serverless: sem `listen` e sem simulação de rede, como o servidor de produção.
export default createServerApp().app
