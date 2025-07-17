<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <h2>Page non trouvée</h2>
      <p>Oups ! La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <router-link to="/" class="btn btn-primary">
        <i class="fas fa-home me-2"></i> Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageNotFound',
  mounted() {
    document.title = 'Page non trouvée | COSEMERIC'
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 2rem;
  text-align: center;
}

.error-content {
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 8rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  color: #dc3545;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

p {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary i {
  font-size: 0.9em;
}
</style>
