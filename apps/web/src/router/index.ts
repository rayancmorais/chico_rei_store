import Vue from 'vue'
import VueRouter, { type Route, type RouterOptions } from 'vue-router'
import CatalogView from '@/views/CatalogView.vue'

Vue.use(VueRouter)

type Position = Parameters<NonNullable<RouterOptions['scrollBehavior']>>[2]

// Trocar de página ou de tela volta ao topo; marcar um filtro mantém a rolagem onde está.
export function scrollBehavior(to: Route, from: Route, savedPosition: Position) {
  if (savedPosition) return savedPosition
  if (to.path !== from.path || to.query.page !== from.query.page) return { x: 0, y: 0 }
}

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
  scrollBehavior,
})
