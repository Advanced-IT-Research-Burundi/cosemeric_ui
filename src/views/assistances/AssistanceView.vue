<template>
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Gestion des assistances</h2>
      <router-link to="/assistances/add" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Ajouter une assistance
      </router-link>
    </div>

    <div class="card">
      <AdvancedTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        search-placeholder="Rechercher des assistances..."
        no-data-message="Aucune assistance trouvée"
        :show-filters="true"
        :has-actions="true"
        row-key="id"
        details-endpoint="assistances"
        details-title="Détails de l'assistance"
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

        <template #actions="{ item, openDetails }">
          <div class="btn-group">
            <button
              class="btn btn-outline-secondary btn-sm"
              @click="openDetails(item)"
              title="Voir détails"
            >
              <i class="fas fa-eye"></i>
            </button>
          </div>
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

const store = useStore();
const assistances = ref([]);
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
  { key: "membre.nom", label: "Membre", width: "100px", sortable: true },
  {
    key: "type_assistance.nom",
    label: "Type d'assistance",
    width: "100px",
    sortable: true,
  },
  { key: "montant", label: "Montant", sortable: true, filterable: true },
  {
    key: "date_approbation",
    label: "Date d'approbation",
    sortable: true,
    filterable: true,
    format: "date",
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
const fetchAssistances = async () => {
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

    const response = await api.get("/assistances", params);

    // Handle your API response structure
    if (response.success) {
      assistances.value = response.data || [];
      store.state.assistances = response.data || [];
    } else {
      console.error("API Error:", response.message);
    }
  } catch (error) {
    console.error("Error fetching assistances:", error);
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
  fetchAssistances();
};

const handleSort = (sortData) => {
  queryParams.value.sort_field = sortData.field;
  queryParams.value.sort_order = sortData.order;
  queryParams.value.page = 1;
  fetchAssistances();
};

const handleFilter = (filters) => {
  queryParams.value.filters = filters;
  queryParams.value.page = 1;
  fetchAssistances();
};

const handlePageChange = (page) => {
  queryParams.value.page = page;
  fetchAssistances();
};

const handlePerPageChange = (perPage) => {
  queryParams.value.per_page = perPage;
  queryParams.value.page = 1;
  fetchAssistances();
};

const handleEdit = (assistance) => {
  router.push({ name: "assistancesEdit", params: { id: assistance.id } });
};

const handleDelete = (assistance) => {
  if (confirm("Etês-vous sûr de vouloir supprimer cette assistance?")) {
    api
      .delete(`/assistances/${assistance.id}`)
      .then((response) => {
        console.log("Assistance supprimée avec succès!");
        fetchAssistances();
      })
      .catch((error) => {
        console.error(
          "Une erreur est survenue lors de la suppression de l'assistance:",
          error
        );
      });
  }
};

onMounted(() => {
  fetchAssistances();
});

const tableData = computed(() => {
  return store.state.assistances || [];
});
</script>
