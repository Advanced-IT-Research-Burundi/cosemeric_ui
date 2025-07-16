<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false
    }
  },
  created() {
    this.checkAuth();
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = !!localStorage.getItem('isAuthenticated');
    },
    handleLogout() {
      localStorage.removeItem('isAuthenticated');
      this.isAuthenticated = false;
      this.$router.push('/login');
    }
  },
  watch: {
    $route() {
      this.checkAuth();
    }
  }
}
</script>

<style>

.nav-link {
  margin-right: 10px;
}

.router-link-active {
  font-weight: bold;
  color: #42b983 !important;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
