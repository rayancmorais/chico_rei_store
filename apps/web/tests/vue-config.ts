import Vue from 'vue'

// Arquivo à parte, carregado antes do setup.ts: o Vue agenda esses avisos (instalar o devtools,
// ligar o modo de produção) num setTimeout assim que é importado, e no setup.ts os outros imports
// dariam tempo de o timer disparar antes de a configuração mudar.
Vue.config.devtools = false
Vue.config.productionTip = false
