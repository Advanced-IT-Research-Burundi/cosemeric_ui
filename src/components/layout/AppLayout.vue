<template>
  <div class="app-layout">
    <!-- Overlay for mobile sidebar -->
    <div 
      class="sidebar-overlay" 
      :class="{ 'show': !isCollapsed && isMobile }"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': !isCollapsed && isMobile }">
      <div class="logo-container">
        <div class="logo-wrapper">
          <i class="bi bi-droplet-fill logo-icon"></i>
          <h2 v-show="!isCollapsed" class="logo-text">CASOMIREC</h2>
        </div>
      </div>

      <nav class="nav-menu custom-scrollbar">
        <div class="menu-label" v-if="!isCollapsed">MENU PRINCIPAL</div>
        
        <template v-for="(item, index) in menuItems" :key="index">
          <router-link
            :to="item.path"
            class="menu-item-link"
            v-if="item.requireAdmin"
            v-slot="{ isActive, navigate }"
            custom
          >
            <div
              class="menu-item"
              :class="{ 'active': isRouteActive(item.path), 'collapsed': isCollapsed }"
              @click="navigate"
              :title="isCollapsed ? item.title : ''"
            >
              <div class="icon-wrapper" v-html="item.icon"></div>
              <span v-show="!isCollapsed" class="menu-title">{{ item.title }}</span>
              <div v-if="isActive && !isCollapsed" class="active-indicator"></div>
            </div>
          </router-link>
        </template>
      </nav>

      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="version-info">
          <span>v1.0.0</span>
        </div>
      </div>
    </div>

    <!-- Main Content Wrapper -->
    <div class="main-wrapper" :class="{ collapsed: isCollapsed }">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="btn-toggle">
            <i class="bi" :class="isCollapsed ? 'bi-list' : 'bi-text-indent-right'"></i>
          </button>
          
          <div class="current-page-title d-none d-md-block">
            {{ currentRouteName }}
          </div>
        </div>

        <div class="header-right">
          <!-- Notification Icon -->
          <div 
            class="header-action-item" 
            ref="notificationRef"
          >
            <button 
              class="btn-icon notification-btn" 
              @click.stop="toggleNotificationDropdown"
              :class="{ active: showNotificationDropdown }"
            >
              <i class="bi bi-bell"></i>
              <span v-if="notificationCount > 0" class="notification-badge">
                {{ notificationCount }}
              </span>
            </button>

            <!-- Notification Dropdown -->
            <transition name="fade-slide">
              <div class="dropdown-menu-custom notification-menu" v-if="showNotificationDropdown" @click.stop>
                <div class="dropdown-header">
                  <h3>Notifications</h3>
                  <button 
                    v-if="notificationCount > 0"
                    class="btn-text" 
                    @click="markAllAsRead"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
                
                <div class="notification-list custom-scrollbar">
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="notification-item"
                    :class="{ unread: !notification.read }"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-icon-wrapper" :class="notification.type">
                      <i :class="getNotificationIcon(notification.type)"></i>
                    </div>
                    <div class="notification-content">
                      <div class="notification-top">
                        <span class="notification-title">{{ notification.title }}</span>
                        <span class="notification-time">{{ notification.time }}</span>
                      </div>
                      <p class="notification-message">{{ notification.message }}</p>
                    </div>
                    <div class="unread-dot" v-if="!notification.read"></div>
                  </div>

                  <div v-if="notifications.length === 0" class="empty-state">
                    <div class="empty-icon">
                      <i class="bi bi-bell-slash"></i>
                    </div>
                    <p>Aucune notification</p>
                  </div>
                </div>

                <div class="dropdown-footer">
                  <router-link to="/notifications" class="view-all-link">
                    Voir toutes les notifications
                    <i class="bi bi-arrow-right"></i>
                  </router-link>
                </div>
              </div>
            </transition>
          </div>

          <div class="divider-vertical"></div>

          <!-- User Profile -->
          <div
            class="header-action-item"
            ref="profileRef"
          >
            <div 
              class="user-profile-trigger"
              @click.stop="toggleUserDropdown"
              :class="{ active: showUserDropdown }"
            >
              <div class="user-avatar">
                <span>{{ userInitials }}</span>
              </div>
              <div class="user-info d-none d-md-flex">
                <span class="name">{{ userName }}</span>
                <span class="role">{{ userRole }}</span>
              </div>
              <i class="bi bi-chevron-down ms-2 text-muted"></i>
            </div>

            <transition name="fade-slide">
              <div class="dropdown-menu-custom user-menu" v-if="showUserDropdown" @click.stop>
                <div class="user-menu-header">
                  <div class="user-avatar large">
                    <span>{{ userInitials }}</span>
                  </div>
                  <div class="user-menu-info">
                    <span class="name">{{ userName }}</span>
                    <span class="email text-muted small">utilisateur@example.com</span>
                  </div>
                </div>
                
                <div class="user-menu-items">
                  <div class="menu-item" @click="navigateToProfile">
                    <i class="bi bi-person"></i>
                    <span>Mon Profil</span>
                  </div>
                  <div
                    class="menu-item"
                    @click="navigateToUserManagement"
                    v-if="isAdmin"
                  >
                    <i class="bi bi-people"></i>
                    <span>Gestion des Utilisateurs</span>
                  </div>
                  <div class="menu-divider"></div>
                  <div class="menu-item danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Déconnexion</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <div class="content-container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useStore } from "vuex";
import useAuthGuard from "../../utils/useAuthGuard.js";

defineOptions({
  name: "AppLayout",
});

// Router composables
const router = useRouter();
const route = useRoute();

// Store composables
const store = useStore();
const authStore = useAuthStore();
const { isAdmin, isMember, isGuest, isAuth } = useAuthGuard();

// Responsive state
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value <= 992);

// Reactive data
const isCollapsed = ref(false);
const showUserDropdown = ref(false);
const showNotificationDropdown = ref(false);
const profileRef = ref(null);
const notificationRef = ref(null);

// Initialize collapsed state based on screen size
const initSidebarState = () => {
  if (window.innerWidth <= 992) {
    isCollapsed.value = true;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  initSidebarState();
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener("click", onClickOutside);
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value <= 992) {
    isCollapsed.value = true;
  }
};

// Route matching helper
const isRouteActive = (path) => {
  return route.path.startsWith(path);
};

// Notifications (Mock Data)
const notifications = ref([
  {
    id: 1,
    type: 'credit',
    title: 'Crédit Approuvé',
    message: 'Votre demande de 500k BIF a été validée.',
    time: '2h',
    read: false
  },
  {
    id: 2,
    type: 'contribution',
    title: 'Cotisation Reçue',
    message: 'Votre paiement de 50k BIF est confirmé.',
    time: '5h',
    read: false
  },
  {
    id: 3,
    type: 'info',
    title: 'Rappel Réunion',
    message: 'Assemblée générale le 15 Décembre.',
    time: '1j',
    read: true
  }
]);

const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const menuItems = ref([
  {
    icon: '<i class="bi bi-grid-fill"></i>',
    title: "Tableau de bord",
    path: "/dashboard",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-people-fill"></i>',
    title: "Membres",
    path: "/members",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-wallet-fill"></i>',
    title: "Cotisations",
    path: "/contributions",
    requireAdmin: isAdmin.value || isMember.value,
  },
  {
    icon: '<i class="bi bi-calendar-event-fill"></i>',
    title: "Périodes",
    path: "/periodes",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-credit-card-2-front-fill"></i>',
    title: "Crédits",
    path: "/credits",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-credit-card-2-front"></i>',
    title: "Mes Crédits",
    path: "/credits/mescredits",
    requireAdmin: isMember.value,
  },
  {
    icon: '<i class="bi bi-plus-square-dotted"></i>',
    title: "Demande Crédit",
    path: "/credits/demande",
    requireAdmin: isMember.value,
  },
  {
    icon: '<i class="bi bi-life-preserver"></i>',
    title: "Assistances",
    path: "/assistances",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-arrow-repeat"></i>',
    title: "Remboursements",
    path: "/remboursements",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-file-earmark-spreadsheet-fill"></i>',
    title: "Fiche Mensuel",
    path: "/importationMensuel",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-cash-stack"></i>',
    title: "Cotis. Mensuelle",
    path: "/cotisationMensuelle",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-graph-up"></i>',
    title: "Rapports",
    path: "/reports",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-shield-check"></i>',
    title: "Administration",
    path: "/admin",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-person-badge-fill"></i>',
    title: "Utilisateurs",
    path: "/users",
    requireAdmin: isAdmin.value,
  },
]);

// Computed properties
const currentRouteName = computed(() => {
  const name = route.meta.title || route.name || "";
  return capitalizeFirstLetter(name);
});

const userInitials = computed(() => {
  const user = authStore.user || {};
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  return authStore.user?.name
    ? authStore.user.name.charAt(0).toUpperCase()
    : "U";
});

const userName = computed(() => {
  const user = authStore.user || {};
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return authStore.user?.name ?? "Utilisateur";
});

const userRole = computed(() => {
  const user = authStore.user || {};
  if (user.role) {
    return capitalizeFirstLetter(user.role);
  }
  return "Rôle inconnu";
});

// Methods
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value;
  showNotificationDropdown.value = false;
};

const toggleNotificationDropdown = () => {
  showNotificationDropdown.value = !showNotificationDropdown.value;
  showUserDropdown.value = false;
};

const getNotificationIcon = (type) => {
  const icons = {
    credit: 'bi bi-credit-card',
    contribution: 'bi bi-wallet2',
    info: 'bi bi-info-circle',
  };
  return icons[type] || 'bi bi-bell';
};

const handleNotificationClick = (notification) => {
  notification.read = true;
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};

const navigateToProfile = () => {
  router.push("/profile");
  showUserDropdown.value = false;
};

const navigateToUserManagement = () => {
  router.push("/users");
  showUserDropdown.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const onClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showUserDropdown.value = false;
  }
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    showNotificationDropdown.value = false;
  }
  // Close sidebar on mobile when clicking outside
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.btn-toggle');
  if (isMobile.value && !isCollapsed.value && sidebar && !sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
    isCollapsed.value = true;
  }
};
</script>

<style scoped>
/* Importing Inter font for a modern feel */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #2563EB; /* Vibrant Blue from Image */
  --primary-hover: #1D4ED8;
  --primary-light: #EFF6FF;
  --sidebar-bg: #1E3A8A; /* Deep Blue for Sidebar Premium Look */
  --sidebar-text: #E5E7EB;
  --sidebar-text-hover: #FFFFFF;
  --sidebar-item-active: rgba(255, 255, 255, 0.1);
  --header-height: 70px;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 80px;
  --bg-color: #F3F4F6;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --transition-speed: 0.3s;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
}

/* Sidebar Styling */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #2563EB 0%, #1E40AF 100%);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  transition: all var(--transition-speed) ease;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.logo-container {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.05);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: white;
  letter-spacing: 0.5px;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-label {
  padding: 0 24px;
  margin-bottom: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.menu-item-link {
  text-decoration: none;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  margin: 4px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-item.collapsed {
  padding: 12px;
  justify-content: center;
  margin: 4px 10px;
}

.menu-item .icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  min-width: 24px;
}

.menu-title {
  margin-left: 12px;
  white-space: nowrap;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  background-color: white;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.version-info {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* Scrollbar Customization */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Main Wrapper */
.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.main-wrapper.collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

/* Header Styling */
.app-header {
  height: var(--header-height);
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-toggle {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-toggle:hover {
  background-color: #f3f4f6;
  color: var(--primary-color);
}

.current-page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.divider-vertical {
  width: 1px;
  height: 32px;
  background-color: #e5e7eb;
  margin: 0 8px;
}

.header-action-item {
  position: relative;
}

.btn-icon {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  position: relative;
}

.btn-icon:hover, .btn-icon.active {
  background-color: #EFF6FF;
  color: var(--primary-color);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: #EF4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  height: 16px;
  min-width: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
}

/* Dropdowns */
.dropdown-menu-custom {
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid #e5e7eb;
  z-index: 100;
  overflow: hidden;
  transform-origin: top right;
}

.notification-menu {
  width: 360px;
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #F0F9FF;
}

.notification-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #EFF6FF;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon-wrapper.credit { background-color: #ECFDF5; color: #10B981; }
.notification-icon-wrapper.warning { background-color: #FFFBEB; color: #F59E0B; }

.notification-content {
  flex: 1;
}

.notification-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.notification-time {
  font-size: 12px;
  color: #9CA3AF;
}

.notification-message {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.unread-dot {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.dropdown-footer {
  padding: 12px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

.view-all-link {
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* User Menu */
.user-menu {
  width: 240px;
}

.user-profile-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-profile-trigger:hover, .user-profile-trigger.active {
  background-color: #f3f4f6;
}

.user-avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info .name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-info .role {
  font-size: 12px;
  color: var(--text-secondary);
}

.user-menu-header {
  padding: 20px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-avatar.large {
  width: 64px;
  height: 64px;
  font-size: 24px;
  margin-bottom: 12px;
}

.user-menu-info .name {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-menu-items {
  padding: 8px;
}

.menu-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  margin: 0 !important; /* Override sidebar margin */
}

.menu-item:hover {
  background-color: #f3f4f6;
  color: var(--primary-color);
}

.menu-item.danger {
  color: #EF4444;
}

.menu-item.danger:hover {
  background-color: #FEF2F2;
}

.menu-divider {
  height: 1px;
  background-color: #f3f4f6;
  margin: 8px 0;
}

/* Page Content */
.page-content {
  padding: 30px;
  flex: 1;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 45;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    backdrop-filter: blur(2px);
  }

  .sidebar-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .main-wrapper, .main-wrapper.collapsed {
    margin-left: 0;
  }

  .app-header {
    padding: 0 16px;
  }

  .page-content {
    padding: 16px;
  }
}
</style>