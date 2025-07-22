<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">Gestion des Crédits</h1>
          <router-link to="/credits/new" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>Nouveau Crédit
          </router-link>
        </div>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher..." 
                v-model="searchQuery"
                @keyup.enter="searchCredits"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="statusFilter" @change="fetchCredits">
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="rejete">Rejeté</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des crédits -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Membre</th>
                <th class="text-end">Montant demandé</th>
                <th class="text-end">Montant accordé</th>
                <th class="text-center">Taux d'intérêt</th>
                <th class="text-center">Durée (mois)</th>
                <th class="text-center">Statut</th>
                <th class="text-center">Date demande</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="credit in listesCredits" :key="credit.id" class="align-middle">
                <td>#{{ credit.id }}</td>
                <td>Membre #{{ credit.membre_id }}</td>
                <td class="text-end">{{ formatCurrency(credit.montant_demande) }}</td>
                <td class="text-end">{{ formatCurrency(credit.montant_accorde) }}</td>
                <td class="text-center">{{ credit.taux_interet }}%</td>
                <td class="text-center">{{ credit.duree_mois }}</td>
                <td class="text-center">
                  <span :class="`badge bg-${getStatusBadgeClass(credit.statut)}`">
                    {{ formatStatus(credit.statut) }}
                  </span>
                </td>
                <td class="text-center">{{ formatDate(credit.date_demande) }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" title="Voir les détails">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-secondary" title="Éditer">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="card-footer bg-white">
        <Pagination 
          v-if="credits.last_page > 1"
          :current-page="currentPage"
          :total-pages="credits.last_page"
          @page-changed="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useStore } from 'vuex';
import api from '../../services/api';
import Pagination from '../../components/Pagination.vue';

// Références réactives
const store = useStore();
const credits = ref({
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
});

const listesCredits = computed(() => store.state?.credits?.data|| []);
const currentPage = ref(1);
const searchQuery = ref('');
const statusFilter = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Formateurs
const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'BIF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatStatus = (status) => {
  const statusMap = {
    'en_attente': 'En attente',
    'approuve': 'Approuvé',
    'rejete': 'Rejeté'
  };
  return statusMap[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'en_attente': 'warning',
    'approuve': 'success',
    'rejete': 'danger'
  };
  return classes[status] || 'secondary';
};

// Récupération des crédits
const fetchCredits = async (page = 1) => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await api.get('/credits', {
      params: {
        page,
        search: searchQuery.value,
        status: statusFilter.value
      }
    });
    // save data to the store 
    store.state.credits = response.data;
    
    credits.value = response.data;
    currentPage.value = response.data.current_page;
  } catch (error) {
    console.error('Erreur lors de la récupération des crédits:', error);
    errorMessage.value = 'Une erreur est survenue lors du chargement des crédits.';
  } finally {
    isLoading.value = false;
  }
};

// Gestion de la recherche avec délai
let searchTimeout = null;
const searchCredits = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchCredits(1);
  }, 500);
};

// Gestion du changement de page
const onPageChange = (page) => {
  currentPage.value = page;
  fetchCredits(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Réinitialisation des filtres
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  fetchCredits(1);
};

// Surveillance des changements de filtres
watch([searchQuery, statusFilter], () => {
  if (searchQuery.value || statusFilter.value) {
    fetchCredits(1);
  }
});

// Au chargement du composant
onMounted(() => {
  fetchCredits(1);
});
</script>

<style scoped>
.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-top: none;
  padding: 0.75rem 1rem;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  font-weight: 500;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

.table-responsive {
  min-height: 300px;
}
</style>