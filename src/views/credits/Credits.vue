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
        :data="wrappedTableData" :columns="columns"
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
const credits = ref([]); // Variable locale (peut être retirée si store.state.credits est la seule source)
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
  // Clé simplifiée (membre_id) confirmée par les logs précédents
  { key: "membre_id", label: "Membre (ID)", width: "100px", sortable: true }, 
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
    params.page = queryParams.value.page;
    params.per_page = queryParams.value.per_page;
    
    // Ajout des autres paramètres (search, sort, filter) ...

    let response = null; 
    
    if (!auth.hasAnyRole("admin")) {
      response = await api.get("/mescredits", { params });
    } else {
      response = await api.get("/credits", { params });
    }

    console.log("--- Réponse de l'API (brute) ---", response);

    // Extraction sécurisée des données (le tableau d'objets)
    const creditData = response.data?.data || response.data || [];
    
    console.log("--- Données extraites pour la table ---", creditData);

    // Mise à jour de l'état Vuex
    if (Array.isArray(creditData)) {
        credits.value = creditData;
        store.state.credits = creditData;
    } else {
        console.error("API Error: Données de crédits non trouvées ou non-tableau.");
        credits.value = [];
        store.state.credits = [];
    }

  } catch (error) {
    console.error("Error fetching credits:", error);
  } finally {
    loading.value = false;
  }
};

// ... (Helper functions getClassByStatut et getStatusLabel)

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

// ... (Event handlers handleSearch, handleSort, etc.)

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

// Le tableau simple (l'array de crédits)
const rawCreditData = computed(() => {
  return store.state.credits || [];
});

// ⭐ CORRECTION DÉFINITIVE : Envelopper le tableau dans le format attendu par AdvancedTable
const wrappedTableData = computed(() => {
  const dataArray = rawCreditData.value;
  const totalItems = dataArray.length;
  
  return {
    // Le tableau de données est passé sous la clé 'data'
    data: dataArray,
    current_page: 1, 
    last_page: 1,    
    per_page: queryParams.value.per_page, 
    total: totalItems,     
    from: totalItems > 0 ? 1 : 0,
    to: totalItems,
  };
});
</script>