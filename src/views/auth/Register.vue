<template>
  <div class="register-page d-flex align-items-center justify-content-center">
    <div class="register-card">
      <!-- Panneau gauche -->
      <div class="register-info d-none d-lg-flex flex-column p-5">
        <div class="text-center mb-5">
          <div class="logo-circle mb-3">
            <i class="fas fa-user-plus fa-3x"></i>
          </div>

          <h1 class="h2 fw-bold mb-2 text-white">{{ APP_CONFIG.name }}</h1>
          <p class="text-white-75 mb-0">{{ APP_CONFIG.description }}</p>
          <small class="text-white-50">Version {{ APP_CONFIG.version }}</small>
        </div>

        <div class="flex-grow-1">
          <h5 class="mb-4 fw-bold text-white">Pourquoi nous rejoindre ?</h5>
          <div v-for="(feature, index) in FEATURES" :key="index" class="d-flex align-items-start mb-4 feature-item">
            <div class="feature-icon me-3">
              <i :class="feature.icon"></i>
            </div>
            <div>
              <h6 class="mb-1 fw-bold text-white">{{ feature.label }}</h6>
              <p class="mb-0 small text-white-75">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <div class="mt-auto d-flex align-items-center text-white-75">
          <i class="fas fa-lock me-2"></i>
          <small>Vos informations sont sécurisées</small>
        </div>
      </div>

      <!-- Panneau droit -->
      <div class="register-form-wrapper d-flex flex-column justify-content-center p-5">
        <div class="text-center mb-5">
          <h2 class="h3 fw-bold mb-2 text-dark">Créer un compte</h2>
          <p class="text-muted mb-0">Rejoignez la plateforme CASOMIREC</p>
        </div>

        <form @submit.prevent="submitForm" class="register-form">
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Matricule" v-model="form.matricule" required />
            <select v-model="form.categorie_id" required>
              <option value="" disabled>Sélectionnez une catégorie</option>
              <option v-for="categorie in categories" :key="categorie.id" :value="categorie.id">
                {{ categorie.proper_name }}
              </option>
            </select>

            <input type="text" placeholder="Nom" v-model="form.nom" required />
            <input type="text" placeholder="Prénom" v-model="form.prenom" required />
            <input type="email" placeholder="Email" v-model="form.email" required />
            <input type="tel" placeholder="Téléphone" v-model="form.telephone" required />

            <div class="position-relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mot de passe"
                v-model="form.password"
                required
              />
              <i
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                class="toggle-password"
                @click="togglePassword"
              ></i>
            </div>

            <div class="position-relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirmer le mot de passe"
                v-model="form.password_confirmation"
                required
              />
              <i
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                class="toggle-password"
                @click="togglePassword"
              ></i>
            </div>
          </div>

          <button type="submit" class="submit-btn w-100 mt-4" :disabled="isLoading">
            <span v-if="!isLoading">S'inscrire</span>
            <div v-else class="loading-content">
              <div class="spinner"></div>
              <span>Création...</span>
            </div>
          </button>

          <div class="form-links mt-4 text-center">
            <small class="text-muted">
              Déjà un compte ?
              <router-link to="/login" style="color: #3b82f6" class="fw-semibold">
                Se connecter
              </router-link>
            </small>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import api from "../../services/api"
import { useToast } from "vue-toastification"

const toast = useToast()
const router = useRouter()
const errorMessage = ref("")
const isLoading = ref(false)
const showPassword = ref(false)

const APP_CONFIG = {
  name: "CASOMIREC",
  description: "Système de gestion des cotisations et adhérents",
  version: "1.0.0",
}

const FEATURES = [
  { icon: "fas fa-hand-holding-usd", label: "Cotisations simplifiées", description: "Gérez vos paiements en ligne." },
  { icon: "fas fa-users", label: "Communauté active", description: "Rejoignez un réseau d'adhérents." },
  { icon: "fas fa-chart-line", label: "Suivi transparent", description: "Consultez vos contributions à tout moment." },
  { icon: "fas fa-lock", label: "Données protégées", description: "Sécurité et confidentialité garanties." },
]

const form = ref({
  matricule: "",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  categorie_id: "",
  password: "",
  password_confirmation: "",
  statut: "inactif",
  date_adhesion: new Date().toISOString().split("T")[0],
})

const categories = [
  { id: 1, proper_name: "Cadre Contractuel" },
  { id: 2, proper_name: "Collaborateur A2" },
  { id: 3, proper_name: "Chauffeur Planton" },
  { id: 4, proper_name: "Service Externe 10" },
  { id: 5, proper_name: "Service Externe 5" },
]

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function submitForm() {
  errorMessage.value = ""
  try {
    isLoading.value = true
    const res = await api.post("/register", form.value)
    toast.success(res.message || "Inscription réussie !")
    router.push("/login")
  } catch (error) {
    console.error("Erreur lors de la création :", error)
    errorMessage.value = error.response?.data?.message || "Erreur lors de l'inscription."
    toast.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
}

.register-card {
  display: flex;
  width: 100%;
  max-width: 1000px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  background-color: #fff;
}

/* --- Panneau gauche --- */
.register-info {
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.text-white { color: #fff !important; }
.text-white-75 { color: rgba(255, 255, 255, 0.75) !important; }
.text-white-50 { color: rgba(255, 255, 255, 0.5) !important; }

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.feature-item .feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
}

/* --- Panneau droit --- */
.register-form-wrapper {
  flex: 1;
  padding: 3rem;
  animation: fadeInUp 0.6s ease-out;
  background-color: #fff;
}

/* === Inputs === */
.register-form input,
.register-form select {
  background-color: #fff !important;
  border: 1px solid #d1d5db !important;
  color: #111827;
  border-radius: 8px;
  padding: 10px 14px;
  width: 100%;
  transition: all 0.2s ease;
}

.register-form input:focus,
.register-form select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
}

.toggle-password {
  cursor: pointer;
  color: #6b7280;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
}

/* === Bouton === */
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

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .register-card { flex-direction: column; }
  .register-info { display: none; }
}
</style>
