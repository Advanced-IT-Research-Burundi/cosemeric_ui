<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="logo-container">
        <h2 v-if="!isCollapsed">COSEMERIC</h2>
        <h2 v-else>C</h2>
      </div>
      <nav class="nav-menu">
        <template v-for="(item, index) in menuItems" :key="index">
           
              <router-link :to="item.path" class="menu-section">
                <div 
                class="menu-header" 
                :class="{ 'active': activeSection === index }"
                @click="toggleSection(index)"
                >
                <i :class="item.icon || ''"></i>
                <span v-if="!isCollapsed" class="title">{{ item.title }}</span>
                </div>
              </router-link>
           
        </template>
      </nav>
      <div class="sidebar-footer">
        
      </div>
    </div>
    <div class="main-content">
        <nav class="admin-header">
          <div class="header-left">
            <button @click="toggleSidebar" class="btn">
                <i class="fa-solid fa-bars"></i>
            </button>
            <!-- <h1>{{ currentRouteName }}</h1> -->
          </div>
          <div class="header-right">
            <div class="user-profile" @click="toggleUserDropdown">
              <div class="user-avatar">
                {{ userInitials }}
              </div>
              <span class="user-name">{{ userName }}</span>
              <i class="fas fa-chevron-down"></i>
              
              <div v-if="showUserDropdown" class="user-dropdown">
                <div class="dropdown-item" @click="navigateToProfile">
                  Mon Profil
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout" @click="handleLogout">
                  Déconnexion
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div>
           <router-view />
        </div>
    </div>
    
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'AppLayout',
  data() {
    return {
      isCollapsed: false,
      activeSection: null,
      showUserDropdown: false,
      menuItems: [
        {
          icon: 'fas fa-home',
          title: 'Tableau de bord',
          path: '/dashboard'
        },
        {
          icon: 'fas fa-users',
          title: 'Membres',
          path: '/members'
        },
        {
          icon: 'fas fa-money-bill',
          title: 'Cotisations',
          path: '/contributions'
        },
        {
          icon: 'fas fa-sack-dollar',
          title: 'Crédits',
          path: '/credits'
        },
        {
          icon: 'fas fa-hand-holding-dollar',
          title: 'Assistance',
          path: '/assistances'
        },
        {
          icon: 'fas fa-chart-line',
          title: 'Rapports',
          path: '/reports'
        },
        {
          icon: 'fas fa-cog',
          title: 'Administration',
          path: '/admin'
        }
      ]
    };
  },
  computed: {
    currentRouteName() {
      const route = this.$route;
      const name = route.meta.title || route.name || '';
      return this.capitalizeFirstLetter(name);
    },
    userInitials() {
      const authStore = useAuthStore();
      const user = authStore.user || {};
      if (user.firstName && user.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
      }
      return 'U';
    },
    userName() {
      const authStore = useAuthStore();
      const user = authStore.user || {};
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return 'Utilisateur';
    }
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleSection(index) {
      if (this.activeSection === index) {
        this.activeSection = null;
      } else {
        this.activeSection = index;
      }
    },
    toggleUserDropdown() {
      this.showUserDropdown = !this.showUserDropdown;
    },
    navigateToProfile() {
      this.$router.push('/profile');
      this.showUserDropdown = false;
    },
    async handleLogout() {
      try {
        const authStore = useAuthStore();
        await authStore.logout();
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
    onClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showUserDropdown = false;
      }
    }
  }
};
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  background-color: #f9fafb;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  transition: width var(--transition-speed) ease;
  position: relative;
  z-index: 100;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.logo-container {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container h2 {
  color: var(--primary-color);
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.menu-section {
  margin-bottom: 0.5rem;
  text-decoration: none !important;
}

.menu-header {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center !important;
  gap: 10px;
  color: var(--text-light);
  font-weight: 500;
  transition: all var(--transition-speed) ease;
  border-left: 3px solid transparent;
}

.menu-header:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  text-decoration: none;
}

.menu-header.active {
  color: white !important;
  background-color: var(--primary-light);
  border-left-color: var(--primary-color);
}

.menu-header .icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.menu-header .title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.menu-header .arrow {
  font-size: 0.75rem;
  transition: transform var(--transition-speed) ease;
}

.menu-header.active .arrow {
  transform: rotate(0);
}

.submenu {
  overflow: hidden;
  transition: max-height var(--transition-speed) ease;
}

.submenu-item {
  display: block;
  padding: 0.5rem 1.5rem 0.5rem 3.5rem;
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all var(--transition-speed) ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submenu-item:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

.submenu-item.active {
  color: white !important;
  font-weight: 500;
  background-color: var(--primary-color);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  font-size: 1.25rem;
  padding: 0;
  border-radius: 4px;
  transition: all var(--transition-speed) ease;
}

.toggle-btn:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  
  transition: margin var(--transition-speed) ease;
  min-height: 100vh;
  background-color: #f9fafb;
}

.sidebar.collapsed + .main-content {
  margin-left: var(--sidebar-collapsed-width);
}

/* Admin Header Styles */
.admin-header {
  background: white;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-right {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.4rem !important;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.user-profile:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2c3e50;
  transition: background-color 0.2s;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 0.25rem 0;
}

.logout {
  color: #dc3545;
}

.logout:hover {
  background-color: #fff5f5;
}

/* Header Styles */
.app-header {
  height: var(--header-height);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 24px;
  width: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.hamburger-icon {
  width: 100%;
  height: 2px;
  background-color: #2c3e50;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.hamburger-btn:hover .hamburger-icon {
  background-color: var(--primary-color);
}

/* Animation when sidebar is collapsed */
.sidebar.collapsed + .main-content .hamburger-icon:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.sidebar.collapsed + .main-content .hamburger-icon:nth-child(2) {
  opacity: 0;
}

.sidebar.collapsed + .main-content .hamburger-icon:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-light);
  display: none;
}

.header-left h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background var(--transition-speed) ease;
}

.user-profile:hover {
  background-color: var(--hover-bg);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1rem;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
}

/* Page Content */
.page-content {
  padding: 1.5rem;
  min-height: calc(100vh - var(--header-height));
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all var(--transition-speed) ease;
  max-height: 500px;
}

.slide-enter, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Styles */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 1000;
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .sidebar.show-mobile {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .app-header {
    padding-left: 1rem;
  }
}

/* Animation for sidebar toggle */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideOut {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
</style>
