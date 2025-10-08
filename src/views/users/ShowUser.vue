<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Détails de l'utilisateur</h2>
      <div class="d-flex gap-2">
        <router-link to="/users" class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left me-2"></i>Retour à la liste
        </router-link>
        <router-link :to="{ name: 'usersEdit', params: { id } }" class="btn btn-primary">
          <i class="fas fa-edit me-2"></i>Modifier
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else class="card p-4">
      <div v-if="error" class="alert alert-danger mb-4" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="mb-2 text-muted">Prénom</div>
          <div class="h6">{{ user.prenom || '-' }}</div>
        </div>
        <div class="col-md-6">
          <div class="mb-2 text-muted">Nom</div>
          <div class="h6">{{ user.nom || '-' }}</div>
        </div>

        <div class="col-md-6">
          <div class="mb-2 text-muted">Email</div>
          <div class="h6">{{ user.email || '-' }}</div>
        </div>
        <div class="col-md-6">
          <div class="mb-2 text-muted">Téléphone</div>
          <div class="h6">{{ user.telephone || '-' }}</div>
        </div>

        <div class="col-md-6">
          <div class="mb-2 text-muted">Rôle</div>
          <div class="h6 text-capitalize">{{ user.role || 'membre' }}</div>
        </div>
        <div class="col-md-6">
          <div class="mb-2 text-muted">Statut</div>
          <div>
            <span class="badge rounded-1" :class="getClassByStatut(user.statut)">
              {{ (user.statut || '').toString() }}
            </span>
          </div>
        </div>

        <div class="col-md-6">
          <div class="mb-2 text-muted">Actif</div>
          <div>
            <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-secondary'">
              {{ user.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </div>
        </div>

        <div class="col-md-6">
          <div class="mb-2 text-muted">Créé le</div>
          <div class="h6">{{ formatDate(user.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()

const id = route.params.id
const loading = ref(true)
const error = ref('')
const user = ref({})

const formatDate = (value) => {
  if (!value) return '-'
  try { return new Date(value).toLocaleDateString() } catch { return value }
}

const getClassByStatut = (statut) => {
  if (statut === 'actif') return 'bg-success'
  if (statut === 'inactif') return 'bg-danger'
  if (statut === 'suspendu') return 'bg-warning'
  return 'bg-secondary'
}

async function fetchUser() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get(`/users/${id}`)
    user.value = res?.data || res || {}
  } catch (err) {
    const msg = err?.response?.data?.message || "Erreur lors du chargement de l'utilisateur"
    error.value = msg
    toast.error(msg)
  } finally {
    loading.value = false
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
