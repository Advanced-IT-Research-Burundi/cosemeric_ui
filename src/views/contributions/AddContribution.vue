<template>
    <div class="container py-4 px-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Nouvelle Cotisation</h2>
        <router-link to="/contributions" class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left me-2"></i>Retour à la liste
        </router-link>
      </div>
  
      <div class="card">
        <div class="card-body">

          <!-- Step 1: Select Member -->
          <div v-if="currentStep === 1" class="row g-3">
            <div class="col-md-12">
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input
                  type="search"
                  class="form-control py-2"
                  placeholder="Rechercher un membre (au moins 2 caractères)"
                  aria-label="Membre"
                  v-model="searchMember"
                  @input="onSearchInput"
                >
              </div>

              <!-- Loading -->
              <div v-if="loadingMembers" class="form-text mt-2">
                <i class="fas fa-spinner fa-spin me-1"></i>Chargement des membres...
              </div>

              <!-- Results -->
              <ul v-if="members.length > 0"
                class="list-group mt-2"
                style="max-height: 240px; overflow-y: auto;"
              >
                <li
                  v-for="member in members"
                  :key="member.id"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  :class="{ active: formData.membre_id === member.id }"
                  role="button"
                  @click="selectMember(member)"
                >
                  <span>
                    {{ member.nom }} {{ member.prenom }}
                  </span>
                  <i v-if="formData.membre_id === member.id" class="fas fa-check"></i>
                </li>
              </ul>

              <!-- No results -->
              <div
                v-if="!loadingMembers && searchMember && members.length === 0"
                class="form-text text-muted mt-2"
              >
                Aucun membre trouvé pour "{{ searchMember }}"
              </div>

              <!-- Selected summary -->
              <div v-if="formData.membre_id" class="alert alert-info d-flex align-items-center mt-2" role="alert">
                <i class="fas fa-user me-2"></i>
                <div>
                  Membre sélectionné :
                  <strong>{{ formData.membre?.nom }} {{ formData.membre?.prenom }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Cotisation details -->
          <div v-if="currentStep === 2" class="row g-3">
            
            <!-- Show selected member name -->
            <div v-if="formData.membre_id" class="alert alert-info d-flex align-items-center mt-2" role="alert">
              <i class="fas fa-user me-2"></i>
              <div>
                Membre sélectionné :
                <strong>{{ formData.membre?.nom }} {{ formData.membre?.prenom }}</strong>
              </div>
            </div>

            <!-- Période -->
            <div class="col-md-6">
              <label for="periode_id" class="form-label">Période <span class="text-danger">*</span></label>
              <select
                id="periode_id"
                class="form-select"
                v-model="formData.periode_id"
                required
                :disabled="loadingPeriodes"
              >
                <option value="" disabled>Sélectionnez une période</option>
                <option v-for="periode in periodes" :key="periode.id" :value="periode.id">
                  {{ periode.libelle }} ({{ formatDate(periode.date_debut) }} - {{ formatDate(periode.date_fin) }})
                </option>
              </select>
              <div v-if="loadingPeriodes" class="form-text">
                <i class="fas fa-spinner fa-spin me-1"></i>Chargement des périodes...
              </div>
            </div>

            <!-- Montant et Devise -->
            <div class="col-md-6">
              <label for="montant" class="form-label">Montant <span class="text-danger">*</span></label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  id="montant"
                  v-model.number="formData.montant"
                  min="0"
                  step="0.01"
                  required
                >
                <select
                  class="form-select"
                  style="max-width: 100px;"
                  v-model="formData.devise"
                  required
                >
                  <option value="FBU">FBU</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <!-- Date de Paiement -->
            <div class="col-md-6">
              <label for="date_paiement" class="form-label">Date de Paiement <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                id="date_paiement"
                v-model="formData.date_paiement"
                required
              >
            </div>

            <!-- Mode de Paiement -->
            <div class="col-md-6">
              <label for="mode_paiement" class="form-label">Mode de Paiement <span class="text-danger">*</span></label>
              <select
                id="mode_paiement"
                class="form-select"
                v-model="formData.mode_paiement"
                required
              >
                <option value="1">Espèces</option>
                <option value="2">Virement</option>
                <option value="3">Chèque</option>
                <option value="4">Mobile Money</option>
              </select>
            </div>

            <!-- Référence de Paiement -->
            <div class="col-md-6">
              <label for="reference_paiement" class="form-label">Référence de Paiement</label>
              <input
                type="string"
                class="form-control"
                id="reference_paiement"
                v-model="formData.reference_paiement"
                placeholder="Numéro de référence ou de transaction"
              >
            </div>

            <!-- Statut -->
            <div class="col-12">
              <label for="statut" class="form-label">Statut <span class="text-danger">*</span></label>
              <div class="d-flex gap-4">
                <div class="form-radio">
                  <input type="radio" name="statut" class="form-check-input" id="paye" v-model="formData.statut" value="paye">
                  <label for="paye" class="form-check-label ps-1">Payé</label>
                </div>
                <div class="form-radio">
                  <input type="radio" name="statut" class="form-check-input" id="en_attente" v-model="formData.statut" value="en_attente">
                  <label for="en_attente" class="form-check-label ps-1">En attente</label>
                </div>
                <div class="form-radio">
                  <input type="radio" name="statut" class="form-check-input" id="en_retard" v-model="formData.statut" value="en_retard">
                  <label for="en_retard" class="form-check-label ps-1">En retard</label>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="col-12">
              <label for="notes" class="form-label">Notes</label>
              <textarea
                class="form-control"
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Notes supplémentaires..."
              ></textarea>
            </div>

            <!-- Footer buttons for Step 2 -->
            <div class="d-flex justify-content-between gap-2 mt-4">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="currentStep = 1"
              >
                Précédent
              </button>

              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="$router.push('/contributions')"
                  :disabled="loading"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading || loadingMembers || loadingPeriodes"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="d-none">
            <div v-if="error" class="alert alert-danger mb-4" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
            </div>
  
            <div class="row g-3">
              <!-- Membre -->
              <div class="col-md-6">
                <label for="membre_id" class="form-label">Membre <span class="text-danger">*</span></label>
                <select 
                  id="membre_id" 
                  class="form-select select2" 
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
  
              <!-- Période -->
              <div class="col-md-6">
                <label for="periode_id" class="form-label">Période <span class="text-danger">*</span></label>
                <select 
                  id="periode_id" 
                  class="form-select" 
                  v-model="formData.periode_id" 
                  required
                  :disabled="loadingPeriodes"
                >
                  <option value="" disabled>Sélectionnez une période</option>
                  <option 
                    v-for="periode in periodes" 
                    :key="periode.id" 
                    :value="periode.id"
                  >
                    {{ periode.libelle }} ({{ formatDate(periode.date_debut) }} - {{ formatDate(periode.date_fin) }})
                  </option>
                </select>
                <div v-if="loadingPeriodes" class="form-text">
                  <i class="fas fa-spinner fa-spin me-1"></i>Chargement des périodes...
                </div>
              </div>
  
              <!-- Montant et Devise -->
              <div class="col-md-6">
                <label for="montant" class="form-label">Montant <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input 
                    type="number" 
                    class="form-control" 
                    id="montant" 
                    v-model.number="formData.montant" 
                    min="0" 
                    step="0.01"
                    required
                  >
                  <select 
                    class="form-select" 
                    style="max-width: 100px;" 
                    v-model="formData.devise"
                    required
                  >
                    <option value="FBU">FBU</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
  
              <!-- Date de Paiement -->
              <div class="col-md-6">
                <label for="date_paiement" class="form-label">Date de Paiement <span class="text-danger">*</span></label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="date_paiement" 
                  v-model="formData.date_paiement" 
                  required
                >
              </div>
  
              <!-- Mode de Paiement -->
              <div class="col-md-6">
                <label for="mode_paiement" class="form-label">Mode de Paiement <span class="text-danger">*</span></label>
                <select 
                  id="mode_paiement" 
                  class="form-select" 
                  v-model="formData.mode_paiement" 
                  required
                >
                  <option value="1">Espèces</option>
                  <option value="2">Virement</option>
                  <option value="3">Chèque</option>
                  <option value="4">Mobile Money</option>
                </select>
              </div>
  
              <!-- Référence de Paiement -->
              <div class="col-md-6">
                <label for="reference_paiement" class="form-label">Référence de Paiement</label>
                <input 
                  type="string" 
                  class="form-control" 
                  id="reference_paiement" 
                  v-model="formData.reference_paiement"
                  placeholder="Numéro de référence ou de transaction"
                >
              </div>
  
              <!-- Statut -->
              <div class="col-12">
                <label for="statut" class="form-label">Statut <span class="text-danger">*</span></label>
                <div class="d-flex gap-4">
                    <div class="form-radio">
                    <input type="radio" name="statut" class="form-check-input" id="paye" v-model="formData.statut" value="paye">
                    <label for="paye" class="form-check-label ps-1">Payé</label>
                    </div>
                    <div class="form-radio">
                    <input type="radio" name="statut" class="form-check-input" id="en_attente" v-model="formData.statut" value="en_attente">
                    <label for="en_attente" class="form-check-label ps-1">En attente</label>
                    </div>

                    <div class="form-radio">
                    <input type="radio" name="statut" class="form-check-input" id="en_retard" v-model="formData.statut" value="en_retard">
                    <label for="en_retard" class="form-check-label ps-1">En retard</label>
                    </div>
                </div>
              </div>  
              <!-- Notes -->
              <div class="col-12">
                <label for="notes" class="form-label">Notes</label>
                <textarea 
                  class="form-control" 
                  id="notes" 
                  v-model="formData.notes"
                  rows="3"
                  placeholder="Notes supplémentaires..."
                ></textarea>
              </div>
            </div>
  
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="$router.push('/contributions')"
                :disabled="loading"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="loading || loadingMembers || loadingPeriodes"
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
    const loadingMembers = ref(false);
    const loadingPeriodes = ref(true);
    const error = ref('');

    const members = ref([]);
    const periodes = ref([]);

    const formData = ref({
      membre: {},
      membre_id: '',
      periode_id: '',
      montant: 0,
      devise: 'FBU',
      date_paiement: new Date().toISOString().split('T')[0],
      mode_paiement: 'espece',
      reference_paiement: '',
      statut: null,
      notes: ''
    });

    // below existing refs
    const currentStep = ref(1);

    const goNext = () => {
      if (!formData.value.membre_id) {
        toast.error('Veuillez sélectionner un membre avant de continuer');
        return;
      }
      currentStep.value = 2;
    };

    // New refs
    const searchMember = ref('')

    // Debounced input handler
    const onSearchInput = () => {

      // simple threshold: only search when >= 2 chars
      if (!searchMember.value || searchMember.value.trim().length < 2) {
        members.value = []
        return
      }

      loadingMembers.value = true
      searchMembers()
    }

    // API search
    const searchMembers = async () => {
      loadingMembers.value = true
      try {
        const res = await api.get('/membres', { search: searchMember.value, per_page: 20 })
        members.value = res?.data?.data || []
        console.log(members.value);        
      } catch (err) {
        toast.error('Erreur lors du chargement des membres')
        members.value = []
      } finally {
        loadingMembers.value = false
      }
    }

    // Select a member from results
    const selectMember = (member) => {
      formData.value.membre = member
      formData.value.membre_id = member.id

      // Optional UX: fill the input and collapse results
      searchMember.value = `${member.nom} ${member.prenom}`
      members.value = []

      // Auto-advance to Step 2
      currentStep.value = 2
    }

    // Fetch periods
    const fetchPeriodes = async () => {
    try {
        const response = await api.get('/periodes');
        periodes.value = response.data || [];
    } catch (err) {
        console.error('Error fetching periods:', err);
        toast.error('Erreur lors du chargement des périodes');
    } finally {
        loadingPeriodes.value = false;
    }
    };

    // Format date for display
    const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
    };

    // Handle form submission
    const handleSubmit = async () => {
    loading.value = true;
    error.value = '';

    try {
        // Prepare the data for API
        const payload = {
        ...formData.value,
        statut: formData.value.statut,
        };
        
        const response = await api.post('/cotisations', payload);
        
        if (response.data) {
        toast.success('Cotisation enregistrée avec succès');
        router.push('/contributions');
        } else {
        throw new Error('Réponse inattendue du serveur');
        }
    } catch (err) {
        console.error('Error saving contribution:', err);
        error.value = err.response?.data?.message || 'Erreur lors de l\'enregistrement de la cotisation';
        toast.error(error.value);
    } finally {
        loading.value = false;
    }
    };

    // Fetch data on component mount
    onMounted(() => {
    fetchPeriodes();
    });
</script>
