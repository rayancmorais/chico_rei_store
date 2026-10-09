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
})
