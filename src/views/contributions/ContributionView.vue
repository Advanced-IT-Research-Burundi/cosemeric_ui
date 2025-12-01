<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Toutes les cotisations</h2>
      <router-link
        to="/contributions/add"
        class="btn btn-primary"
        v-if="auth.hasAnyRole('admin')"
      >
        <i class="fas fa-plus me-2"></i>Ajouter une cotisation
      </router-link>
    </div>

    <div class="card">
      <AdvancedTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        search-placeholder="Rechercher des cotisations..."
        no-data-message="Aucune cotisation trouvée"
        :show-filters="true"
        :has-actions="true"
        row-key="id"
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
            {{ ucFirst(value) }}
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
const cotisations = ref([]);
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
    key: "montant",
    label: "Montant",
    sortable: true,
    filterable: true,
    formatter: (value) => formatMontant(value),
  },
  {
    key: "mode_paiement",
    label: "Mode de paiement",
    sortable: true,
    filterable: true,
    formatter: (value) => getModePaiement(value),
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
    formatter: (value) => new Date(value).toLocaleDateString("fr-FR"),
  },
];

// Méthodes utilitaires
const formatMontant = (montant) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "FBU",
  }).format(montant);
};

const getModePaiement = (mode) => {
  const modes = {
    1: "Espèces",
    2: "Virement",
    3: "Chèque",
    4: "Mobile Money",
  };
  return modes[mode] || "Inconnu";
};

const ucFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Fetch data from your API
const fetchCotisations = async () => {
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

    if (!auth.hasAnyRole("admin")) {
      const response = await api.get("/mescotisations", params);
    } else {
      const response = await api.get("/cotisations", params);
    }

    // Handle your API response structure
    if (response.success) {
      cotisations.value = response.data || [];
      store.state.cotisations = response.data || [];
    } else {
      console.error("API Error:", response.message);
    }
  } catch (error) {
    console.error("Error fetching cotisations:", error);
  } finally {
    loading.value = false;
  }
};

const getClassByStatut = (statut) => {
  if (statut === "paye") {
    return "bg-success";
  } else if (statut === "en_attente") {
    return "bg-danger";
  } else if (statut === "en_retard") {
    return "bg-warning";
  } else {
    return "bg-secondary";
  }
};

// Event handlers
const handleSearch = (searchTerm) => {
  queryParams.value.search = searchTerm;
  queryParams.value.page = 1;
  fetchCotisations();
};

const handleSort = (sortData) => {
  queryParams.value.sort_field = sortData.field;
  queryParams.value.sort_order = sortData.order;
  queryParams.value.page = 1;
  fetchCotisations();
};

const handleFilter = (filters) => {
  queryParams.value.filters = filters;
  queryParams.value.page = 1;
  fetchCotisations();
};

const handlePageChange = (page) => {
  queryParams.value.page = page;
  fetchCotisations();
};

const handlePerPageChange = (perPage) => {
  queryParams.value.per_page = perPage;
  queryParams.value.page = 1;
  fetchCotisations();
};

const handleEdit = (cotisation) => {
  console.log(cotisation);
  router.push({ name: "contributionsEdit", params: { id: cotisation.id } });
};
const handleView = (cotisation) => {
  router.push({ name: "viewContribution", params: { id: cotisation.id } });
};

const handleDelete = (cotisation) => {
  if (confirm("Etês-vous sûr de vouloir supprimer ce cotisation?")) {
    api
      .delete(`/cotisations/${cotisation.id}`)
      .then((response) => {
        console.log("Cotisation supprimée avec succès!");
        fetchCotisations();
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
  fetchCotisations();
});

const tableData = computed(() => {
  return store.state.cotisations || [];
});
</script>
