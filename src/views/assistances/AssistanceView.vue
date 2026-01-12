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

            <!-- Approve Button: 
                 - Gestionnaire/Admin can approve if 'en_attente'
                 - Responsable/Admin can approve if 'en_cours' 
            -->
            <button
              v-if="
                (item.statut === 'en_attente' && (isManager || isAdmin)) ||
                (item.statut === 'en_cours' && (isResponsable || isAdmin))
              "
              class="btn btn-success btn-sm"
              @click="handleAction(item, 'approuve')"
              :title="
                item.statut === 'en_attente'
                  ? 'Valider (Gestionnaire)'
                  : 'Approuver (Responsable)'
              "
            >
              <i class="fas fa-check"></i>
            </button>

            <!-- <button
              v-if="isAdmin || isManager || isResponsable"
              class="btn btn-warning btn-sm"
              @click="handleModifier(item)"
              title="Modifier"
            >
              <i class="fas fa-edit"></i>
            </button> -->

            <button
              v-if="
                item.statut !== 'approuve' &&
                item.statut !== 'rejete' &&
                (isAdmin || isManager || isResponsable)
              "
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
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import api from "../../services/api";
import AdvancedTable from "../../components/advancedTable/AdvancedTable.vue";
import router from "../../router";
import useAuthStore from "../../stores/auth";
import { useToast } from "vue-toastification";

const store = useStore();
const auth = useAuthStore();
const toast = useToast();

const isAdmin = auth.hasAnyRole(["admin"]);
const isManager = auth.hasAnyRole(["manager", "gestionnaire"]);
const isResponsable = auth.hasAnyRole(["responsable"]);
const isMember = auth.hasAnyRole(["member", "membre"]);

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
  { key: "membre.full_name", label: "Membre", width: "150px", sortable: true },
  {
    key: "type_assistance.nom",
    label: "Type d'assistance",
    width: "150px",
    sortable: true,
  },
  {
    key: "montant",
    label: "Montant",
    sortable: true,
    filterable: true,
    formatter: (value) => parseFloat(value).toLocaleString() + " FBU",
  },
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
    const params = {
      page: queryParams.value.page,
      per_page: queryParams.value.per_page,
    };

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

    const response = await api.get("/assistances", { params });

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

const handleAction = async (item, action) => {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir ${
        action === "approuve" ? "accepter" : "refuser"
      } cette assistance ?`
    )
  ) {
    return;
  }

  try {
    if (action === "approuve") {
      await api.post(`/assistances/approuve/${item.id}`);
      toast.success("Assistance approuvée avec succès.");
    } else if (action === "rejete") {
      const comment = prompt("Veuillez saisir le motif du rejet");
      if (!comment) {
        toast.warning("Veuillez saisir un motif de rejet.");
        return;
      }
      await api.post(`/assistances/rejete/${item.id}`, { comment });
      toast.success("Assistance rejetée avec succès.");
    }
    fetchAssistances();
  } catch (error) {
    console.error(`Error ${action} assistance:`, error);
    toast.error(`Erreur lors de l'action sur l'assistance.`);
  }
};

const handleModifier = (item) => {
  router.push({ name: "assistancesEdit", params: { id: item.id } });
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
        toast.success("Assistance supprimée avec succès!");
        fetchAssistances();
      })
      .catch((error) => {
        console.error(
          "Une erreur est survenue lors de la suppression de l'assistance:",
          error
        );
        toast.error("Erreur lors de la suppression.");
      });
  }
};

onMounted(() => {
  fetchAssistances();
});

const tableData = computed(() => {
  const data = store.state.assistances || {};
  return {
    data: data.data || [],
    current_page: data.current_page || 1,
    last_page: data.last_page || 1,
    per_page: data.per_page || 15,
    total: data.total || 0,
    from: data.from || 0,
    to: data.to || 0,
  };
});
</script>
