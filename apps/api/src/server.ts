import { startServer } from './start-server'

// Servidor de produção (`npm run start`): nunca tem simulação de rede, seja qual for o .env.
// A simulação mora só no dev-server.ts, que fica fora do build.
startServer()
