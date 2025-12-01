<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-container">
        <h2 v-if="!isCollapsed">
          <i class="fas fa-hand-holding-droplet me-2"></i> CASOMIREC
        </h2>
        <h2 v-else><i class="fas fa-hand-holding-droplet"></i></h2>
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
            <i class="fa-solid fa-bars"></i>
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
            <i class="fas fa-chevron-down"></i>

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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m22 10.5l-9.117-7.678a1.37 1.37 0 0 0-1.765 0L2 10.5"/><path d="M20.5 5v10.5c0 2.828 0 4.243-.879 5.121c-.878.879-2.293.879-5.121.879h-5c-2.828 0-4.243 0-5.121-.879C3.5 19.743 3.5 18.328 3.5 15.5v-6"/><path d="M15 21.5v-5c0-1.414 0-2.121-.44-2.56c-.439-.44-1.146-.44-2.56-.44s-2.121 0-2.56.44C9 14.378 9 15.085 9 16.5v5"/></g></svg>',
    title: "Tableau de bord",
    path: "/dashboard",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M15.5 11a3.5 3.5 0 1 0-7 0a3.5 3.5 0 0 0 7 0"/><path d="M15.483 11.35q.484.149 1.017.15a3.5 3.5 0 1 0-3.483-3.85m-2.034 0a3.5 3.5 0 1 0-2.466 3.7M22 16.5c0-2.761-2.462-5-5.5-5m1 8c0-2.761-2.462-5-5.5-5s-5.5 2.239-5.5 5"/><path d="M7.5 11.5c-3.038 0-5.5 2.239-5.5 5"/></g></svg>',
    title: "Membres",
    path: "/members",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M14.5 10.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0"/><path d="M22 10.5V5.427c0-.568-.324-1.082-.867-1.25C20.19 3.883 18.479 3.5 16 3.5c-4.58 0-5.803 1.677-12.122.424C2.921 3.734 2 4.445 2 5.42v10.017c0 .688.473 1.293 1.145 1.441c5.567 1.228 7.412.32 10.355-.093"/><path d="M2 7.5c1.951 0 3.705-1.595 3.929-3.246M18.5 4c0 2.04 1.765 3.969 3.5 3.969M6 16.996a4 4 0 0 0-4-4M16 15.5a1 1 0 0 1 1-1h5l-1.5-2m1.5 5a1 1 0 0 1-1 1h-5l1.5 2"/></g></svg>',
    title: "Cotisations",
    path: "/contributions",
    requireAdmin: isAdmin.value || isMember.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M17.5 11V7.3c0-2.263 0-3.394-.775-4.097c-.776-.703-2.023-.703-4.52-.703h-4.41c-2.497 0-3.744 0-4.52.703S2.5 5.037 2.5 7.3v6.4c0 2.263 0 3.394.775 4.097c.776.703 2.023.703 4.52.703H11"/><path stroke-linecap="round" stroke-linejoin="round" d="M5.5 6.5h9m-9 4h1m3 0h1m3 0h1m-9 4h1m3 0h1"/><circle cx="17.5" cy="17.5" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="m18.5 18l-1-.5V16"/></g></svg>',
    title: "Periodes",
    path: "/periodes",
    requireAdmin: isAdmin.value || isMember.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="round" d="M20.943 16.835a15.76 15.76 0 0 0-4.476-8.616c-.517-.503-.775-.754-1.346-.986C14.55 7 14.059 7 13.078 7h-2.156c-.981 0-1.472 0-2.043.233c-.57.232-.83.483-1.346.986a15.76 15.76 0 0 0-4.476 8.616C2.57 19.773 5.28 22 8.308 22h7.384c3.029 0 5.74-2.227 5.25-5.165"/><path d="M7.257 4.443c-.207-.3-.506-.708.112-.8c.635-.096 1.294.338 1.94.33c.583-.009.88-.268 1.2-.638C10.845 2.946 11.365 2 12 2s1.155.946 1.491 1.335c.32.37.617.63 1.2.637c.646.01 1.305-.425 1.94-.33c.618.093.319.5.112.8l-.932 1.359c-.4.58-.599.87-1.017 1.035S13.837 7 12.758 7h-1.516c-1.08 0-1.619 0-2.036-.164S8.589 6.38 8.189 5.8z"/><path stroke-linecap="round" d="M13.627 12.919c-.216-.799-1.317-1.519-2.638-.98s-1.53 2.272.467 2.457c.904.083 1.492-.097 2.031.412c.54.508.64 1.923-.739 2.304c-1.377.381-2.742-.214-2.89-1.06m1.984-5.06v.761m0 5.476v.764"/></g></svg>',
    title: "Crédits",
    path: "/credits",
    requireAdmin: isAdmin.value || isMember.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M19.745 13a7 7 0 1 0-12.072-1"/><path d="M14 6c-1.105 0-2 .672-2 1.5S12.895 9 14 9s2 .672 2 1.5s-.895 1.5-2 1.5m0-6c.87 0 1.612.417 1.886 1M14 6V5m0 7c-.87 0-1.612-.417-1.886-1M14 12v1"/><path stroke-linejoin="round" d="M3 14h2.395c.294 0 .584.066.847.194l2.042.988c.263.127.553.193.848.193h1.042c1.008 0 1.826.791 1.826 1.767c0 .04-.027.074-.066.085l-2.541.703a1.95 1.95 0 0 1-1.368-.124L5.842 16.75M12 16.5l4.593-1.411a1.985 1.985 0 0 1 2.204.753c.369.51.219 1.242-.319 1.552l-7.515 4.337a2 2 0 0 1-1.568.187L3 20.02"/></g></svg>',
    title: "Assistances",
    path: "/assistances",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M12.002 9.001c-1.105 0-2 .672-2 1.5c0 .829.895 1.5 2 1.5s2 .672 2 1.5c0 .829-.896 1.5-2 1.5m0-6c.87 0 1.612.418 1.886 1m-1.886-1v-1m0 7c-.87 0-1.612-.417-1.886-1m1.886 1v1"/><path d="M13.5 2.501H12c-4.478 0-6.718 0-8.109 1.392S2.5 7.523 2.5 12s0 6.718 1.391 8.11C5.282 21.5 7.521 21.5 12 21.5c4.478 0 6.718 0 8.109-1.39C21.5 18.718 21.5 16.48 21.5 12v-1.5"/><path stroke-linejoin="round" d="m16.5 7.5l4.176-4.179m.824 3.657l-.118-3.092c0-.729-.435-1.183-1.228-1.24L17.03 2.5"/></g></svg>',
    title: "Remboursements",
    path: "/remboursements",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path d="M20.5 10.5v9c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C19.699 21 19.466 21 19 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-9c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C18.301 9 18.534 9 19 9s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z"/><path stroke-linecap="round" d="M16.5 3h3v3"/><path stroke-linecap="round" d="M19 3.5s-4 5-14.5 8.5"/><path d="M13.5 14v5.5c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C12.699 21 12.466 21 12 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883V14c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54c.184-.077.417-.077.883-.077s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Zm-7 2.5v3c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C5.699 21 5.466 21 5 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-3c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C4.301 15 4.534 15 5 15s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z"/></g></svg>"',
    title: "Fiche Mensuel",
    path: "/importationMensuel",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path d="M20.5 10.5v9c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C19.699 21 19.466 21 19 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-9c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C18.301 9 18.534 9 19 9s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z"/><path stroke-linecap="round" d="M16.5 3h3v3"/><path stroke-linecap="round" d="M19 3.5s-4 5-14.5 8.5"/><path d="M13.5 14v5.5c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C12.699 21 12.466 21 12 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883V14c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54c.184-.077.417-.077.883-.077s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Zm-7 2.5v3c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C5.699 21 5.466 21 5 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-3c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C4.301 15 4.534 15 5 15s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z"/></g></svg>"',
    title: "Cotisation Mensuelle",
    path: "/cotisationMensuelle",
    requireAdmin: isAdmin.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path d="M20.5 10.5v9c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C19.699 21 19.466 21 19 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-9c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C18.301 9 18.534 9 19 9s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z"/><path stroke-linecap="round" d="M16.5 3h3v3"/><path stroke-linecap="round" d="M19 3.5s-4 5-14.5 8.5"/><path d="M13.5 14v5.5c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C12.699 21 12.466 21 12 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883V14c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54c.184-.077.417-.077.883-.077s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Zm-7 2.5v3c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C5.699 21 5.466 21 5 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-3c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C4.301 15 4.534 15 5 15s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z"/></g></svg>',
    title: "Rapports",
    path: "/reports",
    requireAdmin: isAdmin.value || isMember.value,
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="m21.318 7.141l-.494-.856c-.373-.648-.56-.972-.878-1.101c-.317-.13-.676-.027-1.395.176l-1.22.344c-.459.106-.94.046-1.358-.17l-.337-.194a2 2 0 0 1-.788-.967l-.334-.998c-.22-.66-.33-.99-.591-1.178c-.261-.19-.609-.19-1.303-.19h-1.115c-.694 0-1.041 0-1.303.19c-.261.188-.37.518-.59 1.178l-.334.998a2 2 0 0 1-.789.967l-.337.195c-.418.215-.9.275-1.358.17l-1.22-.345c-.719-.203-1.078-.305-1.395-.176c-.318.129-.505.453-.878 1.1l-.493.857c-.35.608-.525.911-.491 1.234c.034.324.268.584.736 1.105l1.031 1.153c.252.319.431.875.431 1.375s-.179 1.056-.43 1.375l-1.032 1.152c-.468.521-.702.782-.736 1.105s.14.627.49 1.234l.494.857c.373.647.56.971.878 1.1s.676.028 1.395-.176l1.22-.344a2 2 0 0 1 1.359.17l.336.194c.36.23.636.57.788.968l.334.997c.22.66.33.99.591 1.18c.262.188.609.188 1.303.188h1.115c.694 0 1.042 0 1.303-.189s.371-.519.59-1.179l.335-.997c.152-.399.428-.738.788-.968l.336-.194c.42-.215.9-.276 1.36-.17l1.22.344c.718.204 1.077.306 1.394.177c.318-.13.505-.454.878-1.101l.493-.857c.35-.607.525-.91.491-1.234s-.268-.584-.736-1.105l-1.031-1.152c-.252-.32-.431-.875-.431-1.375s.179-1.056.43-1.375l1.032-1.153c.468-.52.702-.781.736-1.105s-.14-.626-.49-1.234Z"/><path d="M15.52 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z"/></g></svg>',
    title: "Administration",
    path: "/admin",
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="me-1" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M14 8.5a5 5 0 1 0-10 0a5 5 0 0 0 10 0"/><path d="M16 20.5a7 7 0 1 0-14 0M17 10h5m-5 3h5m-2 3h2"/></g></svg>',
    title: "Utilisateurs",
    path: "/users",
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
