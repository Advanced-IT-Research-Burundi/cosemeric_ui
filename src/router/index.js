import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'

// Import your components
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import PageNotFound from '../views/errors/PageNotFound.vue'

// Lazy load components
const Dashboard = () => import('../views/Dashboard.vue')
// Members
const AllMembers = () => import('../views/members/AllMembers.vue')

// Auth guard
const requireAuth = (to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    next('/login');
  } else {
    next();
  }
};

const routes = [
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  // 404 route
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound,
    meta: { title: 'Page non trouvée' }
  },
  // Authenticated routes
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard
      },
      // Members
      {
        path: 'members',
        children: [
          {
            path: '',
            name: 'AllMembers',
            component: AllMembers
          },
       
        ]
      },
  
    ]
  },
  
  // 404 - Keep this as last route
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound,
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new route
    return { top: 0, behavior: 'smooth' }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} | COSEMERIC` : 'COSEMERIC'
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Store the attempted URL and redirect to login
      authStore.setReturnUrl(to.fullPath)
      return next({ name: 'Login' })
    }
    
    // Check admin role if required
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return next({ name: 'dashboard' })
    }
    
    return next()
  }
  
  // Redirect to dashboard if user is already authenticated and trying to access guest pages
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  
  next()
})

export default router;
