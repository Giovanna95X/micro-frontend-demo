import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: () => import('../views/MonitorView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UserView.vue'),
    },
  ],
});

export default router;
