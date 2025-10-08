<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="mb-4 border-bottom pb-4">
            <h2 class="h4 mb-0">S'inscrire | CASOMIREC</h2>
          </div>
          <div class="card-body p-0">
            <!-- Message d'erreur -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            
            <form @submit.prevent="submitForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="matricule" class="form-label">Matricule</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="matricule" 
                    v-model="form.matricule" 
                    required
                  >
                </div>
                
                <div class="col-md-6">
                  <label for="categorie" class="form-label">Catégorie</label>
                  <select 
                    class="form-select" 
                    id="categorie" 
                    v-model="form.categorie_id"
                    required
                  >
                    <option value="" disabled>Sélectionnez une catégorie</option>
                    <option 
                      v-for="categorie in categories" 
                      :key="categorie.id" 
                      :value="categorie.id"
                    >
                      {{ categorie.proper_name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label for="nom" class="form-label">Nom</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="nom" 
                    v-model="form.nom"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label for="prenom" class="form-label">Prénom</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="prenom" 
                    v-model="form.prenom"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="form.email"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label for="telephone" class="form-label">Téléphone</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="telephone" 
                    v-model="form.telephone"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label for="password" class="form-label">Nouveau mot de passe</label>
                  <div class="position-relative">
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      id="password" 
                    v-model="form.password"
                    required>
                    <button type="button" class="bg-transparent text-secondary border-0 px-3 btn-outline-secondary p-1 position-absolute top-50 end-0 translate-middle-y" @click="togglePassword"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="password_confirmation" class="form-label">Confirmation du mot de passe</label>
                  <div class="position-relative">
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      id="password_confirmation" 
                    v-model="form.password_confirmation"
                    required>
                    <button type="button" class="bg-transparent text-secondary border-0 px-3 btn-outline-secondary p-1 position-absolute top-50 end-0 translate-middle-y" @click="togglePassword"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-4">
                <small class="text-muted">
                  Déjà un compte ? <router-link to="/login">Se connecter</router-link>
                </small>
                <button type="submit" class="btn btn-primary">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    S'inscrire
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex"
import { useRouter } from 'vue-router'
import api from "../../services/api"
import { useToast } from "vue-toastification"

const toast = useToast()
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
  date_adhesion: new Date().toISOString().split('T')[0],
})

const store = useStore()
const router = useRouter()
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

// async function loadCategories() {
//   try {
//     const response = await api.get('/categorie-membres')
//     store.state.categories = response.data
//   } catch (error) {
//     console.error('Erreur lors du chargement des catégories:', error)
//     errorMessage.value = 'Erreur lors du chargement des catégories. Veuillez rafraîchir la page.'
//   }
// }

async function submitForm() {
  errorMessage.value = '' 
    try{
      isLoading.value = true
      
      const res = await api.post('/register', form.value)
      
      toast.success(res.message)
      router.push('/login')
    }
    catch (error) {
      console.error('Erreur lors de la creation du membre:', error)
      errorMessage.value = error.response
      toast.error(error.response.data.message)
    }
    finally {
      isLoading.value = false
    }
           
}

const categories = [
  {'nom':'cadre_contractuel','id':1, 'proper_name': 'Cadre Contractuel'},
  {'nom':'collaborateur_a2','id':2, 'proper_name': 'Collaborateur A2'},
  {'nom':'chauffeur_planton','id':3, 'proper_name': 'Chauffeur Planton'},
  {'nom':'service_externe_10','id':4, 'proper_name': 'Service Externe 10'},
  {'nom':'service_externe_5','id':5, 'proper_name': 'Service Externe 5'}
]
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.form-label {
  font-weight: 500;
}

.btn {
  min-width: 120px;
}
</style>