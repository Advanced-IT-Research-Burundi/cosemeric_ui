<template>
  <div class="container-fluid py-1">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Gestion des Crédits</h2>
      <router-link
        to="/credits/demande"
        class="btn btn-primary"
        v-if="auth.hasAnyRole('admin') || true" 
      >
        <i class="fas fa-plus me-2"></i>Ajouter un crédit
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <!-- Filters Section -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <label class="form-label">Statut</label>
            <select v-model="filters.statut" class="form-select" @change="handleFilterChange">
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="rejete">Rejeté</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Date Demande (Du)</label>
            <input type="date" v-model="filters.date_demande_start" class="form-control" @change="handleFilterChange">
          </div>
          <div class="col-md-3">
            <label class="form-label">Date Demande (Au)</label>
            <input type="date" v-model="filters.date_demande_end" class="form-control" @change="handleFilterChange">
          </div>
           <!-- Date Fin Filter (if applicable, though usually date_demande is more relevant for requests) -->
           <!-- Adding it as requested -->
           <div class="col-md-3">
            <label class="form-label">Date Fin (Après)</label>
            <input type="date" v-model="filters.date_fin" class="form-control" @change="handleFilterChange">
          </div>
        </div>

  
        <AdvancedTable
          :data="wrappedTableData"
          :columns="columns"
          :loading="loading"
          search-placeholder="Rechercher des crédits..."
          no-data-message="Aucun crédit trouvé"
          :show-filters="true"
          :has-actions="true"
          row-key="id"
          @show="handleShow"
          @search="handleSearch"
          @sort="handleSort"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        >
          <template #column-statut="{ value }">
            <span class="badge rounded-1" :class="getClassByStatut(value)">
              {{ getStatusLabel(value) }}
            </span>
          </template>

          <template #actions="{ item }">
            <div class="btn-group">
               <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleShow(item)"
                title="Voir détails"
              >
                <i class="fas fa-eye"></i>
              </button>
              
              <button
                v-if="item.statut === 'en_attente'"
                class="btn btn-success btn-sm"
                @click="handleAction(item, 'approuve')"
                title="Accepter"
              >
                <i class="fas fa-check"></i>
              </button>
              <button
                v-if="item.statut === 'en_attente'"
                class="btn btn-danger btn-sm"
                @click="handleAction(item, 'rejete')"
                title="Refuser"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </template>
        </AdvancedTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import api from "../../services/api";
import AdvancedTable from "../../components/advancedTable/AdvancedTable.vue";
import router from "../../router";
import useAuthStore from "../../stores/auth";
import { useToast } from "vue-toastification";

const auth = useAuthStore();
const store = useStore();
const toast = useToast();
const loading = ref(false);

// Filters
const filters = ref({
  statut: "",
  date_demande_start: "",
  date_demande_end: "",
  date_fin: "",
});

// Query parameters for API
const queryParams = ref({
  page: 1,
  per_page: 15,
  search: "",
  sort_field: "created_at",
  sort_order: "desc",
});

const columns = [
  { key: "id", label: "ID", sortable: true },
  {
    key: "membre.full_name",
    label: "Membre",
    sortable: true,
  },
  {
    key: "montant_demande",
    label: "Montant Demandé",
    sortable: true,
    formatter: (value) => parseFloat(value).toLocaleString() + " FBU",
  },
  {
    key: "montant_accorde",
    label: "Montant Accordé",
    sortable: true,
    formatter: (value) => parseFloat(value).toLocaleString() + " FBU",
  },
  {
    key: "taux_interet",
    label: "Taux",
    sortable: true,
    formatter: (value) => value + " %",
  },
  {
    key: "duree_mois",
    label: "Durée",
    sortable: true,
    formatter: (value) => value + " mois",
  },
  {
    key: "statut",
    label: "Statut",
    sortable: true,
  },
  {
    key: "date_demande",
    label: "Date Demande",
    sortable: true,
    formatter: (value) => new Date(value).toLocaleDateString(),
  },
];

const fetchCredits = async () => {
  loading.value = true;
  try {
    const params = {
      page: queryParams.value.page,
      per_page: queryParams.value.per_page,
      search: queryParams.value.search,
      sort_field: queryParams.value.sort_field,
      sort_order: queryParams.value.sort_order,
      ...filters.value, // Spread filters into params
    };

    const response = await api.get("/credits", { params });
    
    // Handle the response structure provided by user
    // { success: true, data: { current_page: 1, data: [...] } }
    if (response.data && response.data.data) {
        store.state.credits = response.data;
    } else {
         // Fallback if structure is different (e.g. direct pagination object)
        store.state.credits = response.data || {};
    }

  } catch (error) {
    console.error("Error fetching credits:", error);
    toast.error("Erreur lors du chargement des crédits.");
  } finally {
    loading.value = false;
  }
};

const handleAction = async (item, action) => {
  if (!confirm(`Êtes-vous sûr de vouloir ${action === 'approuve' ? 'accepter' : 'refuser'} ce crédit ?`)) {
    return;
  }

  try {
    // Assuming endpoint /credits/{id}/status or similar.
    // If not, we might need to use PUT/PATCH on /credits/{id}
    // Let's try a generic update first.

    alert(action);

    
    //await api.put(`/credits/${item.id}`, { statut: action });

    if(action === 'approuve') {
      await api.post(`/credits/approuve/${item.id}`);
    }else if(action === 'rejete') {
      await api.post(`/credits/rejete/${item.id}`);
    }
    
    toast.success(`Crédit ${action === 'approuve' ? 'accepté' : 'refusé'} avec succès.`);
    fetchCredits();
  } catch (error) {
    console.error(`Error ${action} credit:`, error);
    toast.error(`Erreur lors de l'action sur le crédit.`);
  }
};

const getClassByStatut = (statut) => {
  switch (statut) {
    case "rejete": return "bg-danger";
    case "en_attente": return "bg-warning";
    case "en_cours": return "bg-info";
    case "approuve": return "bg-success";
    case "termine": return "bg-secondary";
    default: return "bg-secondary";
  }
};

const getStatusLabel = (statut) => {
  switch (statut) {
    case "rejete": return "Rejeté";
    case "en_attente": return "En attente";
    case "en_cours": return "En cours";
    case "approuve": return "Approuvé";
    case "termine": return "Terminé";
    default: return statut;
  }
};

// Event Handlers
const handleFilterChange = () => {
  queryParams.value.page = 1;
  fetchCredits();
};

const handleSearch = (searchTerm) => {
  queryParams.value.search = searchTerm;
  queryParams.value.page = 1;
  fetchCredits();
};

const handleSort = (sortData) => {
  queryParams.value.sort_field = sortData.field;
  queryParams.value.sort_order = sortData.order;
  fetchCredits();
};

const handlePageChange = (page) => {
  queryParams.value.page = page;
  fetchCredits();
};

const handlePerPageChange = (perPage) => {
  queryParams.value.per_page = perPage;
  queryParams.value.page = 1;
  fetchCredits();
};

const handleShow = (item) => {
  router.push({ name: "creditsShow", params: { id: item.id } });
};

// Computed Data for AdvancedTable
const wrappedTableData = computed(() => {
  const creditsData = store.state.credits || {};
  return {
    data: creditsData.data || [],
    current_page: creditsData.current_page || 1,
    last_page: creditsData.last_page || 1,
    per_page: creditsData.per_page || 15,
    total: creditsData.total || 0,
    from: creditsData.from || 0,
    to: creditsData.to || 0,
  };
});

onMounted(() => {

  // if auth user is not admin redirect to mescredits
  if (!auth.user?.role?.is_admin) {
    router.push('/credits/mescredits');
  }
  fetchCredits();
});
</script>