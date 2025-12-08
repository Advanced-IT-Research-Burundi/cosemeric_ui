<template>
  <div class="container-fluid py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold text-primary">
            <i class="bi bi-wallet2 me-2"></i>Mes Cotisations
          </h5>
          <div class="d-flex gap-2">
             <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-calendar-event text-muted"></i>
                </span>
                <input 
                  type="month" 
                  class="form-control border-start-0 ps-0" 
                  v-model="searchDate" 
                  @change="fetchCotisations(1)"
                  placeholder="Filtrer par date"
                >
                <button v-if="searchDate" class="btn btn-outline-secondary" @click="resetSearch" title="Effacer le filtre">
                    <i class="bi bi-x-lg"></i>
                </button>
             </div>
          </div>
        </div>
      </div>
      
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 py-3 text-secondary text-uppercase text-xs font-weight-bolder opacity-7">Date</th>
                <th class="py-3 text-secondary text-uppercase text-xs font-weight-bolder opacity-7">Matricule</th>
                <th class="py-3 text-secondary text-uppercase text-xs font-weight-bolder opacity-7 text-end">Salaire Global</th>
                <th class="py-3 text-secondary text-uppercase text-xs font-weight-bolder opacity-7 text-end">Montant Retenu</th>
                <th class="py-3 text-secondary text-uppercase text-xs font-weight-bolder opacity-7 text-end pe-4">Statut</th>
              </tr>
            </thead>
            <tbody v-if="cotisations.data && cotisations.data.length > 0">
              <tr v-for="cotisation in cotisations.data" :key="cotisation.id">
                <td class="ps-4">
                  <div class="d-flex flex-column">
                    <span class="fw-bold text-dark">{{ formatDate(cotisation.date_cotisation) }}</span>
                    <span class="text-xs text-muted">Dossier: {{ cotisation.nomero_dossier || '-' }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ cotisation.matricule || '-' }}</span>
                </td>
                <td class="text-end font-weight-bold">
                    {{ formatCurrency(cotisation.global) }}
                </td>
                <td class="text-end">
                  <span class="text-success fw-bold">{{ formatCurrency(cotisation.retenu) }}</span>
                </td>
                 <td class="text-end pe-4">
                  <span class="badge" :class="getPaymentStatusColor(cotisation)">
                    {{ getPaymentStatusText(cotisation) }}
                  </span>
                </td>
              </tr>
            </tbody>
             <tbody v-else-if="loading">
                 <tr>
                    <td colspan="5" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                    </td>
                 </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Aucune cotisation trouvée pour cette période.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
       <!-- Pagination -->
      <div class="card-footer bg-white py-3 border-top-0" v-if="cotisations.total > 0">
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
                Affichage de {{ cotisations.from || 0 }} à {{ cotisations.to || 0 }} sur {{ cotisations.total }} résultats
            </small>
            <nav aria-label="Page navigation">
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: !cotisations.prev_page_url }">
                        <button class="page-link" @click="fetchCotisations(cotisations.current_page - 1)" :disabled="!cotisations.prev_page_url">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                    </li>
                    <li class="page-item disabled d-none d-sm-block">
                        <span class="page-link border-0">Page {{ cotisations.current_page }} sur {{ cotisations.last_page }}</span>
                    </li>
                    <li class="page-item" :class="{ disabled: !cotisations.next_page_url }">
                         <button class="page-link" @click="fetchCotisations(cotisations.current_page + 1)" :disabled="!cotisations.next_page_url">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import api from '../../services/api';

const store = useStore();
const loading = ref(false);
const searchDate = ref('');

// Access store state directly as per previous pattern, or use local state if store isn't strictly needed for shared state here.
// Assuming we want to keep it in sync with store as per original code.
const cotisations = computed(() => store.state.mesCotisations || { data: [], current_page: 1, total: 0 });

const fetchCotisations = async (page = 1) => {
    loading.value = true;
    try {
        let url = `/cotisations/mesCotisations?page=${page}`;
        if (searchDate.value) {
            url += `&date=${searchDate.value}`;
        }
        
        const response = await api.get(url);
        store.state.mesCotisations = response.data;
    } catch (error) {
        console.error("Erreur lors du chargement des cotisations:", error);
    } finally {
        loading.value = false;
    }
};

const resetSearch = () => {
    searchDate.value = '';
    fetchCotisations(1);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  // Assuming numbers come as strings or numbers, parse if needed
  const amount = parseFloat(value);
  if (isNaN(amount)) return '-';
  
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'BIF', // Changed to BIF based on previous user correction (FBU currency)
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  // Handle 'YYYY-MM' format or full date
  if (dateString.length === 7) { 
      const [year, month] = dateString.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getPaymentStatusText = (cotisation) => {
    // Logic can be adjusted based on business rules. 
    // Example: If 'retenu' > 0 it might be considered 'Payé' or 'Retenu'
    if (cotisation.retenu && parseFloat(cotisation.retenu) > 0) return 'Prélevé';
    return 'En attente';
};

const getPaymentStatusColor = (cotisation) => {
     if (cotisation.retenu && parseFloat(cotisation.retenu) > 0) return 'bg-success-subtle text-success border border-success';
     return 'bg-warning-subtle text-warning border border-warning';
};

onMounted(() => {
    fetchCotisations();
});
</script>

<style scoped>
.text-xs {
    font-size: 0.75rem !important;
}
.bg-success-subtle {
    background-color: #d1e7dd !important;
}
.bg-warning-subtle {
    background-color: #fff3cd !important;
}
</style>