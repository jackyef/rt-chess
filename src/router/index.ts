import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useIdentityStore } from '@/stores/identity'

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
    {
      path: '/pvp/game/:id',
      name: 'pvp-game',
      // route level code-splitting
      // this generates a separate chunk (PvP.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PvPGameView.vue'),
    },
  ],
})

router.beforeEach(async () => {
  const identityStore = useIdentityStore()

  // Only fetch once
  if (!identityStore.identity) {
    await identityStore.refreshIdentity()
  }
})


export default router
