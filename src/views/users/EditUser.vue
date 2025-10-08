<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Modifier l'utilisateur</h2>
      <router-link to="/users" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour à la liste
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="card p-4">
      <div v-if="error" class="alert alert-danger mb-4" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
      </div>
      <div v-if="success" class="alert alert-success mb-4" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ success }}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Prénom <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model.trim="form.prenom" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Nom <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model.trim="form.nom" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Email <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model.trim="form.email" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Téléphone</label>
          <input type="tel" class="form-control" v-model.trim="form.telephone" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Rôle <span class="text-danger">*</span></label>
          <select class="form-select" v-model="form.role" required>
            <option value="" disabled>Sélectionner un rôle</option>
            <option value="admin">Admin</option>
            <option value="gestionnaire">Gestionnaire</option>
            <option value="membre">Membre</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Statut</label>
          <select class="form-select" v-model="form.statut">
            <option value="" disabled>Sélectionner un statut</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Nouveau mot de passe (optionnel)</label>
          <input type="password" class="form-control" v-model="form.password" minlength="6" placeholder="Laisser vide pour ne pas changer" />
        </div>

        <div class="col-md-6 d-flex align-items-center">
          <div class="form-check mt-4">
            <input class="form-check-input" type="checkbox" id="is_active" v-model="form.is_active">
            <label class="form-check-label" for="is_active">
              Compte actif
            </label>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-outline-secondary" @click="$router.push('/users')">Annuler</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ saving ? 'Enregistrement...' : 'Mettre à jour' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const id = route.params.id
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  password: '',
  role: 'membre',
  is_active: true,
  statut: 'actif'
})

async function fetchUser() {
  try {
    const res = await api.get(`/users/${id}`)
    const data = res?.data || res
    form.value = {
      nom: data.nom || '',
      prenom: data.prenom || '',
      email: data.email || '',
      telephone: data.telephone || '',
      role: data.role || 'membre',
      statut: data.statut || 'actif',
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      password: ''
    }
  } catch (err) {
    const msg = err?.response?.data?.message || 'Erreur lors du chargement de l\'utilisateur'
    error.value = msg
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password
    const res = await api.put(`/users/${id}`, payload)
    const message = res?.message || "Utilisateur mis à jour avec succès"
    success.value = message
    toast.success(message)
    router.push('/users')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour de l\'utilisateur'
    error.value = msg
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

onMounted(fetchUser)
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
}
</style>
