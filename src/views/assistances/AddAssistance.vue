<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Nouvelle Demande d'Assistance</h2>
      <router-link to="/assistances" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour à la liste
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div v-if="error" class="alert alert-danger mb-4" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
          </div>

          <div class="row g-3">
            <!-- Membre -->
            <div class="col-md-6">
              <label for="membre_id" class="form-label">Membre <span class="text-danger">*</span></label>
              <select 
                id="membre_id" 
                class="form-select" 
                v-model="formData.membre_id" 
                required
                :disabled="loadingMembers"
              >
                <option value="" disabled>Sélectionnez un membre</option>
                <option 
                  v-for="membre in members" 
                  :key="membre.id" 
                  :value="membre.id"
                >
                  {{ membre.prenom }} {{ membre.nom }}
                </option>
              </select>
              <div v-if="loadingMembers" class="form-text">
                <i class="fas fa-spinner fa-spin me-1"></i>Chargement des membres...
              </div>
            </div>

            <!-- Type d'Assistance -->
            <div class="col-md-6">
              <label for="type_assistance_id" class="form-label">Type d'Assistance <span class="text-danger">*</span></label>
              <select 
                id="type_assistance_id" 
                class="form-select" 
                v-model="formData.type_assistance_id" 
                required
                :disabled="loadingTypes"
              >
                <option value="" disabled>Sélectionnez un type</option>
                <option 
                  v-for="type in assistanceTypes" 
                  :key="type.id" 
                  :value="type.id"
                >
                  {{ type.nom }}: {{ type.montant_standard }} FBU
                </option>
              </select>
              <div v-if="loadingTypes" class="form-text">
                <i class="fas fa-spinner fa-spin me-1"></i>Chargement des types...
              </div>
            </div>

            <!-- Montant -->
            <div class="col-md-6">
              <label for="montant" class="form-label">Montant <span class="text-danger">*</span></label>
              <div class="input-group">
                <input 
                  type="number" 
                  class="form-control" 
                  id="montant" 
                  v-model.number="formData.montant" 
                  min="0" 
                  step="1"
                  required
                >
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <!-- Statut -->
            <div class="col-md-6">
              <label for="statut" class="form-label">Statut <span class="text-danger">*</span></label>
              <select 
                id="statut" 
                class="form-select" 
                v-model="formData.statut" 
                required
              >
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="rejete">Rejeté</option>
                <option value="verse">Versé</option>
              </select>
            </div>

            <!-- Date de Demande -->
            <div class="col-md-4">
              <label for="date_demande" class="form-label">Date de Demande <span class="text-danger">*</span></label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="date_demande" 
                v-model="formData.date_demande" 
                required
              >
            </div>

            <!-- Date d'Approbation -->
            <div class="col-md-4">
              <label for="date_approbation" class="form-label">Date d'Approbation</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="date_approbation" 
                v-model="formData.date_approbation"
              >
            </div>

            <!-- Date de Versement -->
            <div class="col-md-4">
              <label for="date_versement" class="form-label">Date de Versement</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                id="date_versement" 
                v-model="formData.date_versement"
              >
            </div>

            <!-- Justificatif -->
            <div class="col-12">
              <label for="justificatif" class="form-label">Justificatif</label>
              <input 
                type="text" 
                class="form-control" 
                id="justificatif" 
                v-model="formData.justificatif"
                placeholder="Lien ou référence du justificatif"
              >
            </div>

            <!-- Motif de Rejet -->
            <div class="col-12">
              <label for="motif_rejet" class="form-label">Motif du Rejet <span class="text-danger">*</span></label>
              <textarea 
                class="form-control" 
                id="motif_rejet" 
                v-model="formData.motif_rejet"
                rows="2"
                placeholder="Raison du rejet de la demande"
                required
              ></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="$router.push('/assistances')"
              :disabled="loading"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading || loadingMembers || loadingTypes"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../../services/api';

const router = useRouter();
const toast = useToast();

const loading = ref(false);
const loadingMembers = ref(true);
const loadingTypes = ref(true);
const error = ref('');

const members = ref([]);
const assistanceTypes = ref([]);

const formData = ref({
  membre_id: '',
  type_assistance_id: '',
  montant: 0,
  date_demande: new Date().toISOString().slice(0, 16),
  date_approbation: null,
  date_versement: null,
  statut: 'en_attente',
  justificatif: '',
  motif_rejet: ''
});

// Fetch members and assistance types
const fetchData = async () => {
  try {
    const [membersRes, typesRes] = await Promise.all([
      api.get('/membres'),
      api.get('/type-assistances')
    ]);
    
    members.value = membersRes.data.data || [];
    assistanceTypes.value = typesRes.data || [];
  } catch (err) {
    console.error('Error fetching data:', err);
    toast.error('Erreur lors du chargement des données');
  } finally {
    loadingMembers.value = false;
    loadingTypes.value = false;
  }
};

// Handle form submission
const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const payload = { ...formData.value };
    
    // Clean up empty dates
    if (!payload.date_approbation) delete payload.date_approbation;
    if (!payload.date_versement) delete payload.date_versement;
    
    console.log(payload.motif_rejet);
    await api.post('/assistances', payload);
    
    toast.success('Demande d\'assistance enregistrée avec succès');
    router.push('/assistances');
  } catch (err) {
    console.error('Error saving assistance:', err);
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchData();
});
</script>