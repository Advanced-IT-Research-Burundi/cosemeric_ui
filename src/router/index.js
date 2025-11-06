import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import your components
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import PageNotFound from '../views/errors/PageNotFound.vue'
import AdminComponent from '../views/admin/AdminComponent.vue'

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
  {
    path: '/admin',
    name: 'admin',
    component: AdminComponent,
    meta: { requiresAuth: true } 
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/rapports/RapportComponent.vue'),
    meta: { requiresAuth: true } 
  },
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
    component: () => import('../views/auth/Register.vue'),
    meta: { guest: true }
  },
  // 404 route
  
  // Authenticated routes
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    alias: '/',
    meta: { requiresAuth: true } 
  },
  // Test AdvancedTable
  {
    path: '/test',
    name: 'TestAdvancedTable',
    component: () => import('../views/TestAdvancedTable.vue'),
    meta: { requiresAuth: true } 
  },
  
  // Assistances
  {
    path: "/assistances",
    name: "assistances",
    children: [
      {
        path: '',
        name: 'assistancesView',
        component: () => import('../views/assistances/AssistanceView.vue')
      },
      {
        path: 'add',
        name: 'assistancesAdd',
        component: () => import('../views/assistances/AddAssistance.vue')
      },
      {
        path: ':id/edit',
        name: 'assistancesEdit',
        component: () => import('../views/assistances/EditAssistance.vue'),
        props: true
      }
    ],
    meta: { requiresAuth: true } 
  },

  // Credits
  {
    path: '/credits',
    name: 'credits',
    children: [
      {
        path: '',
        name: 'creditsView',
        component: () => import('../views/credits/Credits.vue')
      },
      {
        path: 'add',
        name: 'creditsAdd',
        component: () => import('../views/credits/AddCredit.vue')
      },
      {
        path: ':id/edit',
        name: 'creditsEdit',
        component: () => import('../views/credits/EditCredit.vue'),
        props: true
      }
    ],
    meta: { requiresAuth: true } 
  },
  // Members
  {
    path: '/members',
    name: 'members',
    children: [
      {
        path: '',
        name: 'membersView',
        component: () => import('../views/members/AllMembers.vue')
      },
      {
        path: ':id',
        name: 'memberView',
        component: () => import('../views/members/ViewMember.vue')
      },
      {
        path: 'add',
        name: 'membersAdd',
        component: () => import('../views/members/CreateMember.vue')
      },
      {
        path: ':id/edit',
        name: 'membersEdit',
        component: () => import('../views/members/EditMember.vue')
      },
    ],
    meta: { requiresAuth: true } 
  },

  // Remboursements
  {
    path: '/remboursements',
    name: 'remboursements',
    children: [
      {
        path: '',
        name: 'remboursementsView',
        component: () => import('../views/remboursements/Remboursements.vue')
      },
      {
        path: 'add',
        name: 'remboursementsAdd',
        component: () => import('../views/remboursements/AddRemboursement.vue')
      },
      {
        path: ':id/edit',
        name: 'remboursementsEdit',
        component: () => import('../views/remboursements/EditRemboursement.vue'),
        props: true
      }
    ],
    meta: { requiresAuth: true }
  },

  // Periodes
  {
    path: '/periodes',
    name: 'periodes',
    component: () => import('../views/periodes/Periodes.vue'),
    meta: { requiresAuth: true }
  },

  // Contributions
  {
    path: '/contributions',
    name: 'contributions',
    children: [
      {
        path: '',
        name: 'contributionsView',
        component: () => import('../views/contributions/ContributionView.vue')
      },
      {
        path: 'add',
        name: 'contributionsAdd',
        component: () => import('../views/contributions/AddContribution.vue')
      },
      {
        path: ':id/edit',
        name: 'contributionsEdit',
        component: () => import('../views/contributions/EditContribution.vue')
      },
    ],
    meta: { requiresAuth: true }
  },

  // Users
  {
    path: '/users',
    name: 'users',
    children: [
      {
        path: '',
        name: 'usersView',
        component: () => import('../views/users/Users.vue')
      },
      {
        path: ':id',
        name: 'usersShow',
        component: () => import('../views/users/ShowUser.vue'),
        props: true
      },
      {
        path: 'add',
        name: 'usersAdd',
        component: () => import('../views/users/AddUser.vue')
      },
      {
        path: ':id/edit',
        name: 'usersEdit',
        component: () => import('../views/users/EditUser.vue'),
        props: true
      },
    ],
    meta: { requiresAuth: true }
  },

  // 404 - Keep this as last route
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound,
    meta: { title: 'Page non trouvée', requiresAuth: true }
  },
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
      console.log("not authenticated");
      authStore.setReturnUrl(to.fullPath)
      return next({ name: 'Login' })
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
