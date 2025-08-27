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
            <div class="col-md-6">
              <label for="membre_id" class="form-label">Membre <span class="text-danger">*</span></label>
              <select v-select2
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
            <div class="col-md-6">
              <label for="montant_accorde" class="form-label">Montant Accordé <span class="text-danger">*</span></label>
              <div class="input-group">
                <input 
                  type="number" 
                  class="form-control" 
                  id="montant_accorde" 
                  v-model.number="formData.montant_accorde" 
                  min="0" 
                  step="1"
                  required
                  @input="calculatePayments"
                >
                <span class="input-group-text">FBU</span>
              </div>
            </div>

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
                  required
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
                @input="calculatePayments"
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
            <div class="col-md-6">
              <label for="date_demande" class="form-label">Date de Demande <span class="text-danger">*</span></label>
              <input 
                type="date" 
                class="form-control" 
                id="date_demande" 
                v-model="formData.date_demande" 
                required
              >
            </div>

            <!-- Date d'Approbation -->
            <div class="col-md-6">
              <label for="date_approbation" class="form-label">Date d'Approbation</label>
              <input 
                type="date" 
                class="form-control" 
                id="date_approbation" 
                v-model="formData.date_approbation"
              >
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
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>

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
  membre_id: '',
  montant_demande: 0,
  montant_accorde: 0,
  taux_interet: 0,
  duree_mois: 1,
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
  const montant = parseFloat(formData.value.montant_accorde) || 0;
  const taux = parseFloat(formData.value.taux_interet) || 0;
  const duree = parseInt(formData.value.duree_mois) || 1;
  
  // Calculate total amount with interest
  const interet = (montant * taux * duree) / (12 * 100);
  const total = montant + interet;
  
  // Calculate monthly payment
  const mensualite = duree > 0 ? total / duree : 0;
  
  formData.value.montant_total_rembourser = total.toFixed(0);
  formData.value.montant_mensualite = mensualite.toFixed(0);
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