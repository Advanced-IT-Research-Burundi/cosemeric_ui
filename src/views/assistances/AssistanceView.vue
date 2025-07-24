<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Gestion des Assistances</h1>
      <div class="d-flex align-items-center gap-3">
        <div class="input-group" style="width: 300px;">
          <span class="input-group-text bg-white">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Rechercher..."
            @keyup.enter="fetchAssistances"
          >
        </div>
        <button
          @click="fetchAssistances"
          class="btn btn-primary d-flex align-items-center gap-2"
        >
          <i class="bi bi-arrow-clockwise"></i>
          <span>Actualiser</span>
        </button>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Membre</th>
              <th>Type d'assistance</th>
              <th>Montant</th>
              <th>Date demande</th>
              <th>Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="assistance in assistances.data" :key="assistance.id">
              <td>{{ assistance.id }}</td>
              <td>
                <div class="fw-medium">{{ assistance.membre.nom }} {{ assistance.membre.prenom }}</div>
                <small class="text-muted">{{ assistance.membre.matricule }}</small>
              </td>
              <td>{{ assistance.type_assistance.nom }}</td>
              <td>{{ formatCurrency(assistance.montant) }}</td>
              <td>{{ formatDate(assistance.date_demande) }}</td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-warning text-dark': assistance.statut === 'en_attente',
                    'bg-success': assistance.statut === 'approuve',
                    'bg-danger': assistance.statut === 'rejete'
                  }"
                >
                  {{ formatStatus(assistance.statut) }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button 
                    @click="viewDetails(assistance)" 
                    class="btn btn-outline-primary"
                    title="Voir les détails"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    v-if="assistance.statut === 'en_attente'"
                    @click="approveAssistance(assistance)" 
                    class="btn btn-outline-success"
                    title="Approuver"
                  >
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button 
                    v-if="assistance.statut === 'en_attente'"
                    @click="rejectAssistance(assistance)" 
                    class="btn btn-outline-danger"
                    title="Rejeter"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!assistances?.data?.length">
              <td colspan="7" class="text-center py-4 text-muted">
                Aucune assistance trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="assistances?.links" class="card-footer d-flex justify-content-between align-items-center">
        <div class="text-muted small">
          Affichage de {{ assistances.from || 0 }} à {{ assistances.to || 0 }} sur {{ assistances.total || 0 }} résultats
        </div>
        <nav aria-label="Pagination">
          <ul class="pagination pagination-sm mb-0">
            <li 
              v-for="(link, index) in assistances.links" 
              :key="index"
              class="page-item"
              :class="{ 'active': link.active, 'disabled': !link.url }"
            >
              <a 
                class="page-link" 
                href="#"
                v-html="link.label"
                @click.prevent="link.url && goToPage(link.url)"
              ></a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import api from '../../services/api';

const router = useRouter();
const store = useStore();
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(15);

onMounted(() => {
  fetchAssistances();
});

const fetchAssistances = async (url = null) => {
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value
    };

    const response = url 
      ? await api.get(url, { params: { search: searchQuery.value } })
      : await api.get('/assistances', { params });
    
    store.state.data.assistances = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des assistances:', error);
  }
};
const assistances = computed(() => store.state.data.assistances);
const goToPage = (url) => {
  if (!url) return;
  
  const match = url.match(/page=(\d+)/);
  if (match) {
    currentPage.value = parseInt(match[1]);
  }
  
  fetchAssistances(url);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const formatCurrency = (amount) => {
  if (!amount) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR'
  }).format(amount);
};

const formatStatus = (status) => {
  const statusMap = {
    'en_attente': 'En attente',
    'approuve': 'Approuvé',
    'rejete': 'Rejeté'
  };
  return statusMap[status] || status;
};

const viewDetails = (assistance) => {
  console.log('View details:', assistance);
};

const approveAssistance = async (assistance) => {
  if (confirm('Voulez-vous vraiment approuver cette assistance ?')) {
    try {
      await api.put(`/assistances/${assistance.id}/approve`);
      fetchAssistances();
    } catch (error) {
      console.error('Erreur lors de l\'approbation de l\'assistance:', error);
    }
  }
};

const rejectAssistance = async (assistance) => {
  const reason = prompt('Veuillez saisir la raison du rejet:');
  if (reason !== null) {
    try {
      await api.put(`/assistances/${assistance.id}/reject`, { motif_rejet: reason });
      fetchAssistances();
    } catch (error) {
      console.error('Erreur lors du rejet de l\'assistance:', error);
    }
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>