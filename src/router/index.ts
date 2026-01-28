import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/solo',
      name: 'solo',
      // route level code-splitting
      // this generates a separate chunk (Solo.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/SoloView.vue'),
    },
    {
      path: '/pvp',
      name: 'pvp',
      // route level code-splitting
      // this generates a separate chunk (PvP.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PvPView.vue'),
    },
  ],
})

export default router
