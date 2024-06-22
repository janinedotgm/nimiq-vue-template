import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Create',
    component: () => import('../views/CreateWallet.vue')
  }, 
  {
    path: '/receive',
    name: 'Receive',
    component: () => import('../views/ReceiveFunds.vue') 
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router