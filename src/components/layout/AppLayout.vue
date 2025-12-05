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
                Mon Profil
              </div>
              <div
                class="dropdown-item"
                @click="navigateToUserManagement"
                v-if="isAdmin"
              >
                Gestion des Utilisateurs
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
const profileRef = ref(null);
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
  console.log(showUserDropdown.value);
  showUserDropdown.value = !showUserDropdown.value;
  console.log(showUserDropdown.value);
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
  // Close only if click is outside the profile/dropdown container
  if (profileRef.value && profileRef.value.contains(event.target)) {
    return;
  }
  showUserDropdown.value = false;
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
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-speed) ease;
  max-height: 500px;
}

.slide-enter,
.slide-leave-to {
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
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
