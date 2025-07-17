import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'

// Import your components
import Home from '../views/Home.vue'
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
          // {
          //   path: 'add',
          //   name: 'AddMember',
          //   component: AddMember
          // },
          // {
          //   path: 'categories',
          //   name: 'MemberCategories',
          //   component: MemberCategories
          // },
          // {
          //   path: 'import-export',
          //   name: 'MemberImportExport',
          //   component: MemberImportExport
          // }
        ]
      },
      // Contributions
      // {
      //   path: 'contributions',
      //   children: [
      //     {
      //       path: 'record',
      //       name: 'RecordPayment',
      //       component: RecordPayment
      //     },
      //     {
      //       path: 'monthly',
      //       name: 'MonthlyTracking',
      //       component: MonthlyTracking
      //     },
      //     {
      //       path: 'semi-annual',
      //       name: 'SemiAnnualUSD',
      //       component: SemiAnnualUSD
      //     },
      //     {
      //       path: 'history',
      //       name: 'PaymentHistory',
      //       component: PaymentHistory
      //     }
      //   ]
      // },
      // // Credits
      // {
      //   path: 'credits',
      //   children: [
      //     {
      //       path: 'applications',
      //       name: 'NewApplications',
      //       component: NewApplications
      //     },
      //     {
      //       path: 'approval',
      //       name: 'ApprovalQueue',
      //       component: ApprovalQueue
      //     },
      //     {
      //       path: 'loans',
      //       name: 'ActiveLoans',
      //       component: ActiveLoans
      //     },
      //     {
      //       path: 'repayments',
      //       name: 'RepaymentTracking',
      //       component: RepaymentTracking
      //     }
      //   ]
      // },
      // // Assistance
      // {
      //   path: 'assistance',
      //   children: [
      //     {
      //       path: 'requests',
      //       name: 'NewRequests',
      //       component: NewRequests
      //     },
      //     {
      //       path: 'approvals',
      //       name: 'PendingApprovals',
      //       component: PendingApprovals
      //     },
      //     {
      //       path: 'payments',
      //       name: 'AssistancePaymentHistory',
      //       component: AssistancePaymentHistory
      //     },
      //     {
      //       path: 'types',
      //       name: 'AssistanceTypes',
      //       component: AssistanceTypes
      //     }
      //   ]
      // },
      // // Reports
      // {
      //   path: 'reports',
      //   children: [
      //     {
      //       path: 'monthly',
      //       name: 'MonthlySummary',
      //       component: MonthlySummary
      //     },
      //     {
      //       path: 'financial',
      //       name: 'FinancialStatements',
      //       component: FinancialStatements
      //     },
      //     {
      //       path: 'members',
      //       name: 'MemberReports',
      //       component: MemberReports
      //     },
      //     {
      //       path: 'export',
      //       name: 'ExportData',
      //       component: ExportData
      //     }
      //   ]
      // },
      // // Administration
      // {
      //   path: 'admin',
      //   children: [
      //     {
      //       path: 'users',
      //       name: 'UserManagement',
      //       component: UserManagement
      //     },
      //     {
      //       path: 'settings',
      //       name: 'SystemSettings',
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
