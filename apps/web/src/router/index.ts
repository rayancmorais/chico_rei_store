import Vue from 'vue'
import VueRouter from 'vue-router'
import CatalogView from '@/views/CatalogView.vue'

Vue.use(VueRouter)

export const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', name: 'catalog', component: CatalogView },
    {
      path: '/produto/:id',
      name: 'product',
      component: () => import('@/views/ProductView.vue'),
      props: true,
    },
  ],
  // Trocar de página ou de tela volta ao topo; marcar um filtro mantém a rolagem onde está.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path !== from.path || to.query.page !== from.query.page) return { x: 0, y: 0 }
  },
})
