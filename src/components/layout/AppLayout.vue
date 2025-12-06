<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-container">
        <h2 v-if="!isCollapsed">
          <i class="bi bi-droplet-fill me-2"></i> CASOMIREC
        </h2>
        <h2 v-else><i class="bi bi-droplet-fill"></i></h2>
      </div>
      <nav class="nav-menu">
        <template v-for="(item, index) in menuItems" :key="index">
          <router-link
            :to="item.path"
            class="menu-section"
            v-if="item.requireAdmin"
          >
            <div
              class="menu-header"
              :class="{ active: activePage === index }"
              @click="toggleSection(index)"
            >
              <span v-html="item.icon"></span>
              <span v-if="!isCollapsed" class="title">{{ item.title }}</span>
            </div>
          </router-link>
        </template>
      </nav>
      <div class="sidebar-footer"></div>
    </div>
    <div class="main-content">
      <nav class="admin-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="btn">
            <i class="bi bi-list"></i>
          </button>
        </div>
        <div class="header-right">
          <!-- Notification Icon -->
          <div 
            class="notification-container" 
            ref="notificationRef"
            @click.stop="toggleNotificationDropdown"
          >
            <button class="btn btn-icon position-relative" style="font-size: 20px; background-color: transparent; border: none;">
              <i class="bi bi-bell fs-5"></i>
              <span 
                v-if="notificationCount > 0" 
                class="position-absolute translate-middle badge rounded-pill bg-danger"
                style="top: 10px; font-size: 14px ; padding: 2px 6px;"
              >
                {{ notificationCount }}
                <span class="visually-hidden">notifications non lues</span>
              </span>
            </button>

            <!-- Notification Dropdown -->
            <div class="notification-dropdown" v-if="showNotificationDropdown" @click.stop>
              <div class="notification-header">
                <h6 class="mb-0">Notifications</h6>
                <button 
                  class="btn-mark-read" 
                  @click="markAllAsRead"
                  v-if="notificationCount > 0"
                >
                  Tout marquer comme lu
                </button>
              </div>
              
              <div class="notification-list">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  class="notification-item"
                  :class="{ unread: !notification.read }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-icon" :class="notification.type">
                    <i :class="getNotificationIcon(notification.type)"></i>
                  </div>
                  <div class="notification-content">
                    <p class="notification-title">{{ notification.title }}</p>
                    <p class="notification-message">{{ notification.message }}</p>
                    <span class="notification-time">{{ notification.time }}</span>
                  </div>
                  <div class="notification-badge" v-if="!notification.read"></div>
                </div>

                <div v-if="notifications.length === 0" class="notification-empty">
                  <i class="bi bi-bell-slash fs-1 text-muted"></i>
                  <p>Aucune notification</p>
                </div>
              </div>

              <div class="notification-footer">
                <router-link to="/notifications" class="btn-view-all">
                  Voir toutes les notifications
                </router-link>
              </div>
            </div>
          </div>

          <!-- User Profile -->
          <div
            class="user-profile"
            ref="profileRef"
            @click.stop="toggleUserDropdown"
          >
            <div class="user-avatar">
              {{ userInitials }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <div class="user-role">
                {{ userRole }}
              </div>
            </div>
            <i class="bi bi-chevron-down"></i>

            <div class="user-dropdown" v-if="showUserDropdown" @click.stop>
              <div class="dropdown-item" @click="navigateToProfile">
                <i class="bi bi-person"></i>
                Mon Profil
              </div>
              <div
                class="dropdown-item"
                @click="navigateToUserManagement"
                v-if="isAdmin"
              >
                <i class="bi bi-people"></i>
                Gestion des Utilisateurs
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout" @click="handleLogout">
                <i class="bi bi-box-arrow-right"></i>
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

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useStore } from "vuex";
import useAuthGuard from "../../utils/useAuthGuard.js";

// Define component name (optional, only needed for debugging)
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

// Reactive data
const isCollapsed = ref(false);
const showUserDropdown = ref(false);
const showNotificationDropdown = ref(false);
const profileRef = ref(null);
const notificationRef = ref(null);

// Notifications data (à remplacer par des données réelles de votre API)
const notifications = ref([
  {
    id: 1,
    type: 'credit',
    title: 'Demande de crédit approuvée',
    message: 'Votre demande de crédit de 500,000 BIF a été approuvée',
    time: 'Il y a 2 heures',
    read: false
  },
  {
    id: 2,
    type: 'contribution',
    title: 'Cotisation enregistrée',
    message: 'Votre cotisation mensuelle de 50,000 BIF a été enregistrée',
    time: 'Il y a 5 heures',
    read: false
  },
  {
    id: 3,
    type: 'assistance',
    title: 'Nouvelle assistance disponible',
    message: 'Une assistance de 100,000 BIF est disponible pour vous',
    time: 'Hier',
    read: false
  },
  {
    id: 4,
    type: 'info',
    title: 'Réunion mensuelle',
    message: 'La réunion mensuelle aura lieu le 15 décembre',
    time: 'Il y a 2 jours',
    read: true
  }
]);

const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const menuItems = ref([
  {
    icon: '<i class="bi bi-speedometer2"></i>',
    title: "Tableau de bord",
    path: "/dashboard",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-people"></i>',
    title: "Membres",
    path: "/members",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-cash-coin"></i>',
    title: "Cotisations",
    path: "/contributions",
    requireAdmin: isAdmin.value || isMember.value,
  },
  {
    icon: '<i class="bi bi-calendar-range"></i>',
    title: "Periodes",
    path: "/periodes",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-credit-card"></i>',
    title: "Crédits",
    path: "/credits",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-credit-card"></i>',
    title: "Mes Crédits",
    path: "/credits/mescredits",
    requireAdmin: isMember.value,
  },
  {
    icon: '<i class="bi bi-credit-card"></i>',
    title: "Demande de Credit",
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
    icon: '<i class="bi bi-arrow-counterclockwise"></i>',
    title: "Remboursements",
    path: "/remboursements",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-file-earmark-text"></i>',
    title: "Fiche Mensuel",
    path: "/importationMensuel",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-calendar-check"></i>',
    title: "Cotisation Mensuelle",
    path: "/cotisationMensuelle",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-file-earmark-bar-graph"></i>',
    title: "Rapports",
    path: "/reports",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-shield-lock"></i>',
    title: "Administration",
    path: "/admin",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<i class="bi bi-person-badge"></i>',
    title: "Utilisateurs",
    path: "/users",
    requireAdmin: isAdmin.value,
  },
]);

// Computed properties
const activePage = computed(() => store.state.activePage);

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
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleSection = (index) => {
  if (store.state.activePage === index) {
    store.state.activePage = null;
  } else {
    store.state.activePage = index;
  }
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
    credit: 'bi bi-credit-card-2-front',
    contribution: 'bi bi-cash-coin',
    assistance: 'bi bi-life-preserver',
    info: 'bi bi-info-circle',
    warning: 'bi bi-exclamation-triangle',
    success: 'bi bi-check-circle'
  };
  return icons[type] || 'bi bi-bell';
};

const handleNotificationClick = (notification) => {
  notification.read = true;
  // Naviguer vers la page appropriée selon le type de notification
  // router.push(`/notifications/${notification.id}`);
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
  // Close user dropdown if click is outside
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showUserDropdown.value = false;
  }
  
  // Close notification dropdown if click is outside
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    showNotificationDropdown.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", sans-serif;
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
  padding: 0.75rem 1.1rem;
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
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Notification Styles */
.notification-container {
  position: relative;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  position: relative;
}

.btn-icon:hover {
  background-color: #f5f5f5;
}

.btn-icon i {
  color: #2c3e50;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 380px;
  max-height: 500px;
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.notification-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h6 {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.btn-mark-read {
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.813rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-mark-read:hover {
  background-color: #e7f3ff;
}

.notification-list {
  overflow-y: auto;
  max-height: 380px;
}

.notification-item {
  padding: 1rem 1.25rem;
  display: flex;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.credit {
  background-color: #e3f2fd;
  color: #1976d2;
}

.notification-icon.contribution {
  background-color: #e8f5e9;
  color: #388e3c;
}

.notification-icon.assistance {
  background-color: #fff3e0;
  color: #f57c00;
}

.notification-icon.info {
  background-color: #e0f2f1;
  color: #00897b;
}

.notification-icon.warning {
  background-color: #fff8e1;
  color: #f9a825;
}

.notification-icon.success {
  background-color: #e8f5e9;
  color: #43a047;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #6c757d;
  font-size: 0.813rem;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.notification-time {
  color: #adb5bd;
  font-size: 0.75rem;
}

.notification-badge {
  width: 8px;
  height: 8px;
  background-color: #dc3545;
  border-radius: 50%;
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
}

.notification-empty {
  padding: 3rem 1rem;
  text-align: center;
  color: #adb5bd;
}

.notification-empty i {
  margin-bottom: 1rem;
}

.notification-empty p {
  margin: 0;
  color: #6c757d;
}

.notification-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.btn-view-all {
  color: #007bff;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  display: block;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-view-all:hover {
  background-color: #f8f9fa;
}

/* User Profile Styles */
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
  font-size: 1.2em;
  color: #2c3e50;
}

.user-role {
  font-weight: 400;
  font-size: 0.9em;
  color: #6c757d;
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

  .notification-dropdown {
    width: 320px;
    right: -10px;
  }
}

@media (max-width: 576px) {
  .notification-dropdown {
    width: 280px;
    right: -20px;
  }
  
  .user-details {
    display: none;
  }
}
</style>