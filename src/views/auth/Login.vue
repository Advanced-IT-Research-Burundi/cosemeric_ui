<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <!-- Logo et titre -->
              <div class="text-center mb-4">
                <h2 class="text-primary fw-bold mb-1">CASOMIREC</h2>
                <p class="fs-6 text-muted">Système de Gestion des Cotisations</p>
              </div>

              <!-- Formulaire de connexion -->
              <form @submit.prevent="handleLogin">

                <!-- Message d'erreur général -->
                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    id="email"
                    v-model="form.email"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>

                <!-- Mot de passe -->
                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      id="password"
                      v-model="form.password"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="togglePassword"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>

                <!-- Se souvenir de moi -->
                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="remember"
                    v-model="form.remember"
                  />
                  <small class="form-check-label" for="remember">
                    Se souvenir de moi
                  </small>
                </div>

                <!-- Bouton de connexion -->
                <button
                  type="submit"
                  class="btn btn-primary fs-6 w-100 mb-3"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Connexion...' : 'Se connecter' }}
                </button>
              </form>

              <!-- Liens utiles -->
              <div class="text-center">
                <small class="text-muted">
                  Pas de compte ? <router-link to="/register">S'inscrire</router-link>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api.js'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    
    const isLoading = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')
    
    const form = reactive({
      email: '',
      password: '',
      remember: false
    })
    
    const errors = reactive({
      email: '',
      password: ''
    })

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }
    
    const clearError = (field) => {
      if (field) {
        errors[field] = ''
      } else {
        // Clear all errors
        Object.keys(errors).forEach(key => {
          errors[key] = ''
        })
        errorMessage.value = ''
      }
    }

    const validateForm = () => {
      let isValid = true
      
      // Reset errors
      errors.email = ''
      errors.password = ''
      
      // Validation email
      if (!form.email) {
        errors.email = 'L\'email est requis'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'Format d\'email invalide'
        isValid = false
      }
      
      // Validation mot de passe
      if (!form.password) {
        errors.password = 'Le mot de passe est requis'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        isValid = false
      }
      
      return isValid
    }

    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }

      isLoading.value = true
      errorMessage.value = ''

      try {
        // Make API call to login
        const response = await api.post('/login', {
          email: form.email,
          password: form.password
        })
        
        // Save token to localStorage if 'remember me' is checked
        if (form.remember && response.data.token) {
          localStorage.setItem('auth_token', response.data.token)
        }
        
        // Redirect to dashboard
        router.push('/dashboard')
        
      } catch (error) {
        // Handle API errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 401) {
            errorMessage.value = 'Email ou mot de passe incorrect'
          } else if (error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message
          } else {
            errorMessage.value = 'Une erreur est survenue lors de la connexion'
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage.value = 'Impossible de se connecter au serveur. Veuillez réessayer plus tard.'
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage.value = error.message || 'Une erreur est survenue lors de la connexion'
        }
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      errors,
      isLoading,
      showPassword,
      errorMessage,
      togglePassword,
      clearError,
      handleLogin
    }
  }
}
</script>

<style scoped>
</style>