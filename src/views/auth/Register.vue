<template>
  <div class="auth-page bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h4 class="text-center font-weight-bold mb-4">Créer un compte</h4>
              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label for="name" class="form-label">Nom complet</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    v-model="name"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="email"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="password"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    v-model="confirmPassword"
                    required
                  >
                </div>
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary">S'inscrire</button>
                </div>

                <div class="text-center mt-3 mb-0">
                  <small class="text-muted">
                    Déjà un compte? <router-link to="/login">Se connecter</router-link>
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('Les mots de passe ne correspondent pas !');
        return;
      }
      
      // TODO: Implement registration logic
      console.log('Registration attempt with:', {
        name: this.name,
        email: this.email,
        password: this.password
      });
      
      // For now, redirect to login
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.auth-page {
  padding: 2rem 0;
}
</style>
