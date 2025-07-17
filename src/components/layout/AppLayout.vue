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
          <div class="menu-section">
            <div 
              class="menu-header" 
              :class="{ 'active': activeSection === index }"
              @click="toggleSection(index)"
            >
              <i :class="item.icon || 'fas fa-folder'"></i>
              <span v-if="!isCollapsed" class="title">{{ item.title }}</span>
              <span v-if="!isCollapsed && item.children && item.children.length" class="arrow">
                {{ activeSection === index ? '▼' : '▶' }}
              </span>
            </div>
            <transition name="slide">
              <div v-show="!isCollapsed && (activeSection === index) && item.children && item.children.length" class="submenu">
                <router-link 
                  v-for="(subItem, subIndex) in item.children" 
                  :key="subIndex"
                  :to="subItem.path"
                  class="submenu-item"
                  active-class="active"
                >
                  {{ subItem.title }}
                </router-link>
              </div>
            </transition>
          </div>
        </template>
      </nav>
      <div class="sidebar-footer">
        <button @click="toggleSidebar" class="toggle-btn">
          {{ isCollapsed ? '→' : '←' }}
        </button>
      </div>
    </div>
    <div class="main-content">
        <div>
            <slot></slot>
        </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'AppLayout',
  data() {
    return {
      isCollapsed: false,
      activeSection: null,
      menuItems: [
        {
          icon: '',
          title: 'Tableau de bord',
          path: '/dashboard'
        },
        {
          icon: '',
          title: 'Membres',
          path: '/members'
        },
        {
          icon: '',
          title: 'Cotisations',
          path: '/contributions'
        },
        {
          icon: '',
          title: 'Crédits',
          path: '/credits'
        },
        {
          icon: '',
          title: 'Assistance',
          path: '/assistance'
        },
        {
          icon: '',
          title: 'Rapports',
          path: '/reports'
        },
        {
          icon: '',
          title: 'Administration',
          path: '/admin'
        }
      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleSection(index) {
      if (this.activeSection === index) {
        this.activeSection = null;
      } else {
        this.activeSection = index;
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
}

.menu-header {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--text-light);
  font-weight: 500;
  transition: all var(--transition-speed) ease;
  border-left: 3px solid transparent;
}

.menu-header:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
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
  padding: 0.25rem 0.5rem;
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
  gap: 1rem;
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
