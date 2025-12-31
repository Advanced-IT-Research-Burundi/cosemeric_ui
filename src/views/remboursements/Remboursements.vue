<template>
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Gestion des Remboursements</h2>
      <router-link to="/remboursements/mensuel">
        <i class="fas fa-list me-2"></i>Remboursements Mensuel
      </router-link>
      <router-link to="/remboursements/add" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Ajouter un remboursement
      </router-link>
    </div>

    <div class="card">
      <AdvancedTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        search-placeholder="Rechercher..."
        no-data-message="Aucun remboursement trouvé"
        :show-filters="true"
        :has-actions="true"
        row-key="id"
        details-endpoint="remboursements"
        details-title="Détails du remboursement"
        @edit="handleEdit"
        @delete="handleDelete"
        @search="handleSearch"
        @sort="handleSort"
        @filter="handleFilter"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import router from "../../router";
import api from "../../services/api";
import AdvancedTable from "../../components/advancedTable/AdvancedTable.vue";

const store = useStore();
const remboursements = ref([]);
const loading = ref(false);

const queryParams = ref({
  page: 1,
  per_page: 15,
  search: "",
  sort_field: "",
  sort_order: "asc",
  filters: {},
});
3;
const columns = [
  { key: "id", label: "ID", sortable: true },
  { key: "credit_id", label: "Crédit", sortable: true, filterable: true },
  {
    key: "numero_echeance",
    label: "N° échéance",
    sortable: true,
    filterable: true,
  },
  { key: "montant_prevu", label: "Prévu", sortable: true, filterable: true },
  { key: "montant_paye", label: "Payé", sortable: true, filterable: true },
  {
    key: "date_echeance",
    label: "Échéance",
    sortable: true,
    formatter: (v) => (v ? new Date(v).toLocaleDateString() : ""),
  },
  {
    key: "date_paiement",
    label: "Paiement",
    sortable: true,
    formatter: (v) => (v ? new Date(v).toLocaleDateString() : ""),
  },
  { key: "statut", label: "Statut", sortable: true, filterable: true },
  { key: "penalite", label: "Pénalité", sortable: true, filterable: true },
];

const fetchRemboursements = async () => {
  loading.value = true;
  try {
    const params = {
      page: queryParams.value.page,
      per_page: queryParams.value.per_page,
    };
    if (queryParams.value.search) params.search = queryParams.value.search;
    if (queryParams.value.sort_field) {
      params.sort_field = queryParams.value.sort_field;
      params.sort_order = queryParams.value.sort_order;
    }
    Object.entries(queryParams.value.filters).forEach(([k, v]) => {
      if (v) params[`filter[${k}]`] = v;
    });

    const res = await api.get("/remboursements", params);
    if (res?.data) {
      console.log(res.data);
      remboursements.value = res.data || [];
      store.state.remboursements = res.data || [];
    } else if (res?.success) {
      remboursements.value = res.data || [];
      store.state.remboursements = res.data || [];
    } else {
      remboursements.value = [];
      store.state.remboursements = [];
    }
  } catch (e) {
    console.error("Error fetching remboursements:", e);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (term) => {
  queryParams.value.search = term;
  queryParams.value.page = 1;
  fetchRemboursements();
};
const handleSort = ({ field, order }) => {
  queryParams.value.sort_field = field;
  queryParams.value.sort_order = order;
  queryParams.value.page = 1;
  fetchRemboursements();
};
const handleFilter = (filters) => {
  queryParams.value.filters = filters;
  queryParams.value.page = 1;
  fetchRemboursements();
};
const handlePageChange = (page) => {
  queryParams.value.page = page;
  fetchRemboursements();
};
const handlePerPageChange = (per) => {
  queryParams.value.per_page = per;
  queryParams.value.page = 1;
  fetchRemboursements();
};

const handleEdit = (row) =>
  router.push({ name: "remboursementsEdit", params: { id: row.id } });
const handleDelete = async (row) => {
  if (!confirm("Supprimer ce remboursement ?")) return;
  try {
    await api.delete(`/remboursements/${row.id}`);
    fetchRemboursements();
  } catch (e) {
    console.error(e);
  }
};

const tableData = computed(() => {
  return store.state.remboursements || [];
});

onMounted(fetchRemboursements);
</script>
