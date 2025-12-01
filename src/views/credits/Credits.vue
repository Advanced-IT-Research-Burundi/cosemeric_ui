<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Gestion des Crédits</h2>
      <router-link
        to="/credits/add"
        class="btn btn-primary"
        v-if="auth.hasAnyRole('admin')"
      >
        <i class="fas fa-plus me-2"></i>Ajouter un crédit
      </router-link>
    </div>

    <div class="card">
      <AdvancedTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        search-placeholder="Rechercher des crédits..."
        no-data-message="Aucun crédit trouvé"
        :show-filters="true"
        :has-actions="true"
        row-key="id"
        @show="handleShow"
        @edit="handleEdit"
        @delete="handleDelete"
        @search="handleSearch"
        @sort="handleSort"
        @filter="handleFilter"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Custom column slot -->
        <template #column-statut="{ value }">
          <span class="badge rounded-1" :class="getClassByStatut(value)">
            {{ getStatusLabel(value) }}
          </span>
        </template>
      </AdvancedTable>
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

const auth = useAuthStore();

const store = useStore();
const credits = ref([]);
const loading = ref(false);

// Query parameters for API
const queryParams = ref({
  page: 1,
  per_page: 15,
  search: "",
  sort_field: "",
  sort_order: "asc",
  filters: {},
});

const columns = [
  { key: "id", label: "ID", sortable: true },
  { key: "membre.nom", label: "Nom", width: "100px", sortable: true },
  {
    key: "montant_accorde",
    label: "Montant accordé",
    sortable: true,
    filterable: true,
  },
  {
    key: "taux_interet",
    label: "Taux d'intérêt",
    sortable: true,
    filterable: true,
    formatter: (value) => value + " %",
  },
  {
    key: "duree_mois",
    label: "Durée",
    width: "80px",
    sortable: true,
    filterable: true,
    formatter: (value) => value + " mois",
  },
  {
    key: "statut",
    label: "Statut",
    sortable: true,
    filterable: true,
  },
  {
    key: "created_at",
    label: "Créé le",
    sortable: true,
    formatter: (value) => new Date(value).toLocaleDateString(),
  },
];

// Fetch data from your API
const fetchCredits = async () => {
  loading.value = true;

  try {
    const params = {};

    // Add query parameters
    params.page = queryParams.value.page;
    params.per_page = queryParams.value.per_page;

    if (queryParams.value.search) {
      params.search = queryParams.value.search;
    }

    if (queryParams.value.sort_field) {
      params.sort_field = queryParams.value.sort_field;
      params.sort_order = queryParams.value.sort_order;
    }

    // Add filters
    Object.entries(queryParams.value.filters).forEach(([key, value]) => {
      if (value) {
        params[`filter[${key}]`] = value;
      }
    });

    const response = await api.get("/credits", params);

    console.log(response);

    // Handle your API response structure
    if (response.success) {
      credits.value = response.data || [];
      store.state.credits = response.data || [];
    } else {
      console.error("API Error:", response.message);
    }
  } catch (error) {
    console.error("Error fetching credits:", error);
  } finally {
    loading.value = false;
  }
};

const getClassByStatut = (statut) => {
  if (statut === "rejete") {
    return "bg-danger";
  } else if (statut === "en_attente") {
    return "bg-warning";
  } else if (statut === "en_cours") {
    return "bg-info";
  } else if (statut === "approuve") {
    return "bg-success";
  } else {
    return "bg-secondary";
  }
};

const getStatusLabel = (statut) => {
  if (statut === "rejete") {
    return "Rejeté";
  } else if (statut === "en_attente") {
    return "En attente";
  } else if (statut === "en_cours") {
    return "En cours";
  } else if (statut === "approuve") {
    return "Approuvé";
  } else {
    return "Terminé";
  }
};

// Event handlers
const handleSearch = (searchTerm) => {
  queryParams.value.search = searchTerm;
  queryParams.value.page = 1;
  fetchCredits();
};

const handleSort = (sortData) => {
  queryParams.value.sort_field = sortData.field;
  queryParams.value.sort_order = sortData.order;
  queryParams.value.page = 1;
  fetchCredits();
};

const handleFilter = (filters) => {
  queryParams.value.filters = filters;
  queryParams.value.page = 1;
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

const handleShow = (credit) => {
  router.push({ name: "creditsShow", params: { id: credit.id } });
};

const handleEdit = (credit) => {
  router.push({ name: "creditsEdit", params: { id: credit.id } });
};

const handleDelete = (credit) => {
  if (confirm("Etês-vous sûr de vouloir supprimer ce membre?")) {
    api
      .delete(`/credits/${credit.id}`)
      .then((response) => {
        console.log("Credit supprimé avec succès!");
        fetchCredits();
      })
      .catch((error) => {
        console.error(
          "Une erreur est survenue lors de la suppression du membre:",
          error
        );
      });
  }
};

onMounted(() => {
  fetchCredits();
});

const tableData = computed(() => {
  return store.state.credits || [];
});
</script>
