<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Modifier le membre</h2>
      <router-link to="/members" class="btn btn-outline-secondary">
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
        <div class="col-12">
          <h5 class="mb-3">Informations personnelles</h5>
        </div>

        <div class="col-md-6">
          <label for="prenom" class="form-label">Prénom <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="prenom" v-model="formData.prenom" required>
        </div>

        <div class="col-md-6">
          <label for="nom" class="form-label">Nom <span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="nom" v-model="formData.nom" required>
        </div>

        <div class="col-md-6">
          <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
          <input type="email" class="form-control" id="email" v-model="formData.email" required>
        </div>

        <div class="col-md-6">
          <label for="telephone" class="form-label">Téléphone</label>
          <input type="tel" class="form-control" id="telephone" v-model="formData.telephone">
        </div>

        <div class="col-12 mt-4">
          <h5 class="mb-3">Informations d'adhésion</h5>
        </div>

        <div class="col-md-6">
          <label for="matricule" class="form-label">Matricule</label>
          <input type="text" class="form-control" id="matricule" v-model="formData.matricule">
        </div>

        <div class="col-md-6">
          <label for="categorie_id" class="form-label">Catégorie <span class="text-danger">*</span></label>
          <select class="form-select" id="categorie_id" v-model="formData.categorie_id" required>
            <option value="" disabled>Sélectionnez une catégorie</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.nom }}
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label for="statut" class="form-label">Statut <span class="text-danger">*</span></label>
          <select class="form-select" id="statut" v-model="formData.statut" required>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>

        <div class="col-md-6">
          <label for="date_adhesion" class="form-label">Date d'adhésion <span class="text-danger">*</span></label>
          <input type="date" class="form-control" id="date_adhesion" v-model="formData.date_adhesion" required>
        </div>

        <div class="col-12 mt-4">
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="$router.push('/members')">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ saving ? 'Enregistrement...' : 'Mettre à jour' }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../../services/api.js';
import { useToast } from 'vue-toastification';

export default {
  name: 'EditMember',
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    
    const loading = ref(true);
    const saving = ref(false);
    const error = ref('');
    const success = ref('');
    const categories = ref([]);
    const memberId = route.params.id;
    
    const formData = ref({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      matricule: '',
      categorie_id: '',
      statut: 'actif',
      date_adhesion: new Date().toISOString().split('T')[0]
    });

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categorie-membres');
        if (response.data) {
          categories.value = response.data || [];
        }
      } catch (err) {
        error.value = 'Erreur lors du chargement des catégories';
        toast.error(error.value);
      }
    };

    const fetchMember = async () => {
      try {
        const response = await api.get(`/membres/${memberId}`);
        if (response.data) {
          const memberData = response.data;
          // Format date for input field
          const formattedDate = memberData.date_adhesion ? memberData.date_adhesion.split('T')[0] : new Date().toISOString().split('T')[0];
          
          formData.value = {
            ...memberData,
            date_adhesion: formattedDate
          };
        }
      } catch (err) {
        error.value = 'Erreur lors du chargement des données du membre';
        toast.error(error.value);
      } finally {
        loading.value = false;
      }
    };

    const handleSubmit = async () => {
      saving.value = true;
      error.value = '';
      success.value = '';

      try {
        const response = await api.put(`/membres/${memberId}`, formData.value);
        
        if (response.success) {
          success.value = response.message || 'Membre mis à jour avec succès';
          toast.success(success.value);
          router.push('/members');
        } else {
          throw new Error(response?.message || 'Erreur lors de la mise à jour du membre');
        }
      } catch (err) {
        error.value = err.response?.message || 'Une erreur est survenue lors de la mise à jour du membre';
        toast.error(error.value);
      } finally {
        saving.value = false;
      }
    };

    onMounted(async () => {
      await Promise.all([fetchCategories(), fetchMember()]);
    });

    return {
      formData,
      categories,
      loading,
      saving,
      error,
      success,
      handleSubmit
    };
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
