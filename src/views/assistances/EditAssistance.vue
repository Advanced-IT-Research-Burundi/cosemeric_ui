<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Modifier la Demande d'Assistance</h2>
      <router-link to="/assistances" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour
      </router-link>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div v-if="error" class="alert alert-danger mb-4">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
          </div>

          <div class="row g-3">
            <!-- Member (readonly) -->
            <div class="col-md-6">
              <label class="form-label">Membre</label>
              <input 
                type="text" 
                class="form-control bg-light" 
                :value="`${assistance?.membre?.prenom || ''} ${assistance?.membre?.nom || ''}`"
                readonly
              >
            </div>

            <!-- Type d'Assistance -->
            <div class="col-md-6">
              <label for="type_assistance_id" class="form-label">Type <span class="text-danger">*</span></label>
              <select 
                id="type_assistance_id" 
                class="form-select" 
                v-model="formData.type_assistance_id" 
                required
              >
                <option v-for="type in assistanceTypes" :key="type.id" :value="type.id">
                  {{ type.nom }}: {{ type.montant_standard }}
                </option>
              </select>
            </div>

            <!-- Montant -->
            <div class="col-md-6">
              <label for="montant" class="form-label">Montant <span class="text-danger">*</span></label>
              <div class="input-group">
                <input 
                  type="number" 
                  class="form-control" 
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
              <select id="statut" class="form-select" v-model="formData.statut" required>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="rejete">Rejeté</option>
                <option value="verse">Versé</option>
              </select>
            </div>

            <!-- Dates -->
            <div class="col-md-6">
              <label for="date_demande" class="form-label">Date de Demande <span class="text-danger">*</span></label>
              <input type="datetime-local" class="form-control" v-model="formData.date_demande" required>
            </div>

            <div class="col-md-6">
              <label for="date_approbation" class="form-label">Date d'Approbation</label>
              <input type="datetime-local" class="form-control" v-model="formData.date_approbation"
                :disabled="formData.statut !== 'approuve'">
            </div>

            <div class="col-md-6">
              <label for="date_versement" class="form-label">Date de Versement</label>
              <input type="datetime-local" class="form-control" v-model="formData.date_versement"
                :disabled="formData.statut !== 'verse'">
            </div>

            <!-- Justificatif -->
            <div class="col-12">
              <label for="justificatif" class="form-label">Justificatif</label>
              <input type="text" class="form-control" v-model="formData.justificatif"
                placeholder="Lien ou référence du justificatif">
            </div>

            <!-- Motif de Rejet -->
            <div class="col-12" v-if="formData.statut === 'rejete'">
              <label for="motif_rejet" class="form-label">Motif du Rejet <span class="text-danger">*</span></label>
              <textarea class="form-control" v-model="formData.motif_rejet" rows="2"
                :required="formData.statut === 'rejete'" placeholder="Raison du rejet"></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="$router.push('/assistances')"
              :disabled="saving">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Enregistrement...' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const assistanceId = route.params.id;
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const assistance = ref(null);
const assistanceTypes = ref([]);

const formData = ref({
  type_assistance_id: '',
  montant: 0,
  date_demande: new Date().toISOString().slice(0, 16),
  date_approbation: null,
  date_versement: null,
  statut: 'en_attente',
  justificatif: '',
  motif_rejet: ''
});

const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().slice(0, 16) : null;

const fetchData = async () => {
  try {
    const [assistRes, typesRes] = await Promise.all([
      api.get(`/assistances/${assistanceId}`),
      api.get('/type-assistances')
    ]);
    
    assistance.value = assistRes.data;
    assistanceTypes.value = typesRes.data || [];
    
    const data = assistance.value;
    console.log(data);
    formData.value = {
      type_assistance_id: data.type_assistance_id,
      montant: data.montant,
      date_demande: formatDate(data.date_demande) || new Date().toISOString().slice(0, 16),
      date_approbation: formatDate(data.date_approbation),
      date_versement: formatDate(data.date_versement),
      statut: data.statut,
      justificatif: data.justificatif || '',
      motif_rejet: data.motif_rejet || ''
    };
  } catch (err) {
    console.error('Error:', err);
    toast.error('Erreur lors du chargement');
    router.push('/assistances');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = '';
  
  try {
    const payload = { ...formData.value };
    if (!payload.date_approbation) delete payload.date_approbation;
    if (!payload.date_versement) delete payload.date_versement;
    if (!payload.justificatif) delete payload.justificatif;
    if (payload.statut !== 'rejete') delete payload.motif_rejet;
    
    await api.put(`/assistances/${assistanceId}`, payload);
    toast.success('Mise à jour réussie');
    router.push('/assistances');
  } catch (err) {
    console.error('Error:', err);
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour';
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
};

onMounted(fetchData);
</script>
