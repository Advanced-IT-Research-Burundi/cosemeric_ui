<template>
  <div class="login-page d-flex align-items-center justify-content-center">
    <div class="login-card">
      <!-- Panneau gauche -->
      <div class="login-info d-none d-lg-flex flex-column p-5">
        <div class="text-center mb-5">
          <div class="logo-circle mb-3">
            <i class="fas fa-coins fa-3x"></i>
          </div>

          <h1 class="h2 fw-bold mb-2">{{ APP_CONFIG.name }}</h1>
          <p class="opacity-75 mb-0">{{ APP_CONFIG.description }}</p>
          <small class="opacity-50">Version {{ APP_CONFIG.version }}</small>
        </div>

        <div class="flex-grow-1">
          <h5 class="mb-4 fw-bold">Fonctionnalités principales</h5>
          <div
            v-for="(feature, index) in FEATURES"
            :key="index"
            class="d-flex align-items-start mb-4 feature-item"
          >
            <div class="feature-icon me-3">
              <i :class="feature.icon"></i>
            </div>
            <div>
              <h6 class="mb-1 fw-bold">{{ feature.label }}</h6>
              <p class="mb-0 opacity-75 small">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <div class="mt-auto d-flex align-items-center">
          <i class="fas fa-shield-alt opacity-75 me-2"></i>
          <small class="opacity-75">Connexion sécurisée SSL</small>
        </div>
      </div>

      <!-- Panneau droit (formulaire) -->
      <div class="login-form-wrapper d-flex flex-column justify-content-center p-5">
        <div class="text-center mb-5">
          <h2 class="h3 fw-bold mb-2 text-dark">Connexion</h2>
          <p class="text-muted mb-0">Accédez à votre espace de gestion des cotisations</p>
        </div>

        <form @submit.prevent="login" class="login-form">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="input-group">
            <input
              type="email"
              placeholder="Email"
              v-model="email"
              class="form-input"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe"
              v-model="password"
              class="form-input"
              :disabled="isLoading"
              required
            />
            <i
              :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              class="toggle-password"
              @click="showPassword = !showPassword"
            ></i>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember" />
              <label class="form-check-label text-muted ms-2" for="remember">
                Se souvenir de moi
              </label>
            </div>
            <router-link to="/forgot-password" class="text-decoration-none fw-semibold" style="color: #3b82f6">
              Mot de passe oublié ?
            </router-link>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">Se connecter</span>
            <div v-else class="loading-content">
              <div class="spinner"></div>
              <span>Connexion...</span>
            </div>
          </button>

          <div class="form-links mt-4 text-center">
            <small class="text-muted">
            Pas encore de compte ?
           <router-link to="/register" style="color: #3b82f6" class="fw-semibold">
              Créer un compte
           </router-link>
            </small>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const APP_CONFIG = {
  name: "CASOMIREC",
  description: "Système de gestion des cotisations et adhérents",
  version: "1.0.0",
}

const FEATURES = [
  { icon: "fas fa-wallet", label: "Gestion des cotisations", description: "Enregistrement et suivi des paiements" },
  { icon: "fas fa-users", label: "Gestion des membres", description: "Base de données des adhérents" },
  { icon: "fas fa-chart-bar", label: "Rapports", description: "Suivi des performances financières" },
  { icon: "fas fa-lock", label: "Sécurité", description: "Accès sécurisé et rôles utilisateurs" },
]

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function login() {
  if (isLoading.value) return
  isLoading.value = true
  error.value = ''

  try {
    const success = await authStore.login(email.value, password.value)
    if (!success) throw new Error('Email ou mot de passe incorrect')

    await router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Erreur de connexion'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: Inter, system-ui, sans-serif;
}

.login-card {
  display: flex;
  width: 100%;
  max-width: 1000px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  background-color: #fff;
}

/* Panneau gauche */
.login-info {
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.feature-item .feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.login-form-wrapper {
  flex: 1;
  padding: 3rem;
  animation: fadeInUp 0.6s ease-out;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  align-items: center;
  background: #ffffff; 
  padding: 0.875rem 1rem;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  border: 2px solid #e5e7eb;
  position: relative;
}


.input-group:focus-within {
  border-color: #1e40af; 
}

.form-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: white;
  color: black;
}

.form-input::placeholder {
  color: #000000;
}


.toggle-password {
  cursor: pointer;
  color: #6b7280;
  font-size: 1.2rem;
}

.submit-btn {
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(59,130,246,0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(59,130,246,0.4);
}

.loading-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid #ffffff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  text-align: center;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .login-card { flex-direction: column; }
  .login-info { display: none; }
}
</style>
