<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Nouveau Remboursement</h2>
      <router-link to="/remboursements" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour à la liste
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <!-- Step 1: Select Credit -->
        <div v-if="currentStep === 1" class="row g-3">
          <div class="col-md-12">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input
                type="search"
                class="form-control py-2"
                placeholder="Rechercher un crédit (au moins 2 caractères)"
                aria-label="Crédit"
                v-model="searchCredit"
                @input="onSearchInput"
              >
            </div>

            <div v-if="loadingCredits" class="form-text mt-2">
              <i class="fas fa-spinner fa-spin me-1"></i>Chargement des crédits...
            </div>

            <ul v-if="credits.length > 0" class="list-group mt-2" style="max-height: 240px; overflow-y: auto;">
              <li
                v-for="c in credits"
                :key="c.id"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                :class="{ active: form.credit_id === c.id }"
                role="button"
                @click="selectCredit(c)"
              >
                <span>
                  Crédit #{{ c.id }} — Membre: {{ c.membre?.nom + ' ' + c.membre?.prenom || 'N/A' }} — Montant: {{ c.montant_accorde || c.montant || 0 }}
                </span>
                <i v-if="form.credit_id === c.id" class="fas fa-check"></i>
              </li>
            </ul>

            <div v-if="!loadingCredits && searchCredit && credits.length === 0" class="form-text text-muted mt-2">
              Aucun crédit trouvé pour "{{ searchCredit }}"
            </div>
          </div>
        </div>

        <!-- Step 2: Remboursement Details -->
        <form v-if="currentStep === 2" @submit.prevent="handleSubmit">
          <div v-if="error" class="alert alert-danger mb-4">{{ error }}</div>

          <div v-if="form.credit_id" class="alert alert-info d-flex align-items-center mb-3" role="alert">
            <i class="fas fa-file-invoice-dollar me-2"></i>
            <div>
              Crédit sélectionné : <strong>#{{ form.credit_id }}</strong> pour {{ form.credit.membre?.nom + ' ' + form.credit.membre?.prenom }} | Montant: {{ form.credit.montant_accorde || form.credit.montant || 0 }}
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">N° échéance <span class="text-danger">*</span></label>
              <input type="number" class="form-control" v-model.number="form.numero_echeance" min="1" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Montant prévu <span class="text-danger">*</span></label>
              <div class="input-group">
                <input type="number" class="form-control" v-model.number="form.montant_prevu" min="0" step="1" required />
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Montant payé</label>
              <div class="input-group">
                <input type="number" class="form-control" v-model.number="form.montant_paye" min="0" step="1" />
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Date d'échéance <span class="text-danger">*</span></label>
              <input type="date" class="form-control" v-model="form.date_echeance" required />
            </div>

            <div class="col-md-6">
              <label class="form-label">Date de paiement</label>
              <input type="date" class="form-control" v-model="form.date_paiement" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Statut <span class="text-danger">*</span></label>
              <select class="form-select" v-model="form.statut" required>
                <option value="prevu">Prevu</option>
                <option value="paye">Payé</option>
                <option value="en_retard">En retard</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Pénalité</label>
              <div class="input-group">
                <input type="number" class="form-control" v-model.number="form.penalite" min="0" step="1" />
                <span class="input-group-text">FBU</span>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="currentStep = 1" :disabled="saving">Précédent</button>
            <div>
              <button type="button" class="btn btn-outline-secondary me-2" :disabled="saving" @click="$router.push('/remboursements')">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../../services/api';

const router = useRouter();
const toast = useToast();

const saving = ref(false);
const error = ref('');
const loadingCredits = ref(false);
const credits = ref([]);
const currentStep = ref(1);
const searchCredit = ref('');

const today = new Date().toISOString().split('T')[0];
const form = ref({
  credit: {},
  numero_echeance: 1,
  montant_prevu: 0,
  montant_paye: 0,
  date_echeance: today,
  date_paiement: '',
  statut: 'prevu',
  penalite: 0,
});

const searchCredits = async () => {
  loadingCredits.value = true;
  try {
    const res = await api.get('/credits', { search: searchCredit.value, per_page: 20 });
    credits.value = Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data || []);
  } catch (e) {
    console.error('Error searching credits', e);
    toast.error('Erreur lors du chargement des crédits');
    credits.value = [];
  } finally {
    loadingCredits.value = false;
  }
};

const onSearchInput = () => {
  if (!searchCredit.value || searchCredit.value.trim().length < 2) {
    credits.value = [];
    return;
  }
  searchCredits();
};

const selectCredit = (c) => {
  form.value.credit_id = c.id;
  form.value.credit = c;
  form.value.membre = c.membre;

  // Optional UX: fill the input and collapse results
  searchCredit.value = `${c.membre.nom} ${c.membre.prenom}`
  credits.value = []

  // Auto-advance to Step 2
  currentStep.value = 2
};

const handleSubmit = async () => {
  saving.value = true; error.value = '';
  try {
    const payload = { ...form.value };
    // Ensure numbers are numbers
    payload.numero_echeance = Number(payload.numero_echeance);
    payload.montant_prevu = Number(payload.montant_prevu);
    payload.montant_paye = Number(payload.montant_paye || 0);
    payload.penalite = Number(payload.penalite || 0);

    await api.post('/remboursements', payload);
    toast.success('Remboursement enregistré avec succès');
    router.push('/remboursements');
  } catch (e) {
    console.error('Error saving remboursement', e);
    error.value = e?.response?.data?.message || "Erreur lors de l'enregistrement";
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
};

// No initial fetch; user searches for a credit in Step 1
</script>
