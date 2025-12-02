<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Nouveau Crédit</h2>
      <router-link to="/credits" class="btn btn-outline-secondary">
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
          

            <!-- Montant Demandé -->
            <div class="col-md-6">
              <label for="montant_demande" class="form-label">Montant Demandé <span class="text-danger">*</span></label>
              <div class="input-group">
                <input 
                  type="number" 
                  class="form-control" 
                  id="montant_demande" 
                  v-model.number="formData.montant_demande" 
                  min="0" 
                  step="1"
                  required
                  @input="calculatePayments"
                >
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <!-- Montant Accordé -->
 
            <!-- Taux d'Intérêt -->
            <div class="col-md-6">
              <label for="taux_interet" class="form-label">Taux d'Intérêt (%) <span class="text-danger">*</span></label>
              <div class="input-group">
                <input 
                  type="number" 
                  class="form-control" 
                  id="taux_interet" 
                  v-model.number="formData.taux_interet" 
                  min="0" 
                  max="100"
                  step="1"
                  disabled

                  @input="calculatePayments"
                >
                <span class="input-group-text">%</span>
              </div>
            </div>

            <!-- Durée en Mois -->
            <div class="col-md-6">
              <label for="duree_mois" class="form-label">Durée (mois) <span class="text-danger">*</span></label>
              <input 
                type="number" 
                class="form-control" 
                id="duree_mois" 
                v-model.number="formData.duree_mois" 
                min="1" 
                required
                disabled
              >
            </div>

            <!-- Montant Total à Rembourser -->
            <div class="col-md-6">
              <label class="form-label">Montant Total à Rembourser</label>
              <div class="form-control bg-light">
                {{ formData.montant_total_rembourser }} FBU
              </div>
            </div>

            <!-- Montant de la Mensualité -->
            <div class="col-md-6">
              <label class="form-label">Mensualité</label>
              <div class="form-control bg-light">
                {{ formData.montant_mensualite }} FBU
              </div>
            </div>

            <!-- Date de Demande -->
          

            <!-- Date d'Approbation -->
           

            <!-- Motif -->
            <div class="col-12">
              <label for="motif" class="form-label">Motif du Crédit <span class="text-danger">*</span></label>
              <textarea 
                class="form-control" 
                id="motif" 
                v-model="formData.motif"
                rows="3"
                required
                placeholder="Décrivez la raison du crédit..."
              ></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="$router.push('/credits')"
              :disabled="loading"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading || loadingMembers"
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../../services/api';

const router = useRouter();
const toast = useToast();

const loading = ref(false);
const loadingMembers = ref(true);
const error = ref('');

const members = ref([]);

const formData = ref({
  montant_demande: 0,
  taux_interet: 3,
  duree_mois: 12,
  montant_total_rembourser: 0,
  montant_mensualite: 0,
  date_demande: new Date().toISOString().split('T')[0],
  date_approbation: new Date().toISOString().split('T')[0],
  statut: 'en_attente',
  motif: ''
});

// Fetch members
const fetchMembers = async () => {
  try {
    const response = await api.get('/membres');
    members.value = response.data.data || [];
  } catch (err) {
    console.error('Error fetching members:', err);
    toast.error('Erreur lors du chargement des membres');
  } finally {
    loadingMembers.value = false;
  }
};

// Calculate total amount and monthly payment
const calculatePayments = () => {
  const m_demande = formData.value.montant_demande;
  const tatR = m_demande + ((m_demande * 3) / 100)
  formData.value.montant_total_rembourser = tatR
  formData.value.montant_mensualite = tatR / 12


};

// Handle form submission
const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Prepare the data for API
    const payload = {
      ...formData.value,
      // Convert string numbers to numbers
      montant_demande: formData.value.montant_demande,
      montant_accorde: formData.value.montant_accorde,
      taux_interet: formData.value.taux_interet,
      duree_mois: formData.value.duree_mois
    };

    console.log(payload);
    
    const response = await api.post('/credits', payload);
    
    if (response.data) {
      toast.success('Crédit enregistré avec succès');
      router.push('/credits');
    } else {
      throw new Error('Réponse inattendue du serveur');
    }
  } catch (err) {
    console.error('Error saving credit:', err);
    error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement du crédit';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMembers();
  calculatePayments();
});



</script>