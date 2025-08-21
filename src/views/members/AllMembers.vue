<template>
    <div class="container py-4 px-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Tous les membres</h2>
        <router-link to="/members/add" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Ajouter un membre
        </router-link>
      </div>
  
      <div class="card">
          <AdvancedTable
              :data="tableData"
              :columns="columns"
              :loading="loading"
              search-placeholder="Rechercher des membres..."
              no-data-message="Aucun membre trouvé"
              :show-filters="true"
              :has-actions="true"
              row-key="id"
              @view="handleView"
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
                  {{ value.charAt(0).toUpperCase() + value.slice(1) }}
                  </span>
              </template>

              <template #column-matricule="{ value }">
                  <span class="badge fw-semibold text-bg-secondary rounded-1">{{ value }}</span>
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
  const membres = ref([]);
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
    { key: "matricule", label: "Matricule", width: "100px", sortable: true },
    { key: "full_name", label: "Nom complet", width: "100px", sortable: true },
    { key: "categorie.description", label: "Catégorie", width: "150px", sortable: true },
    {
      key: "created_at",
      label: "Créé le",
      sortable: true,
      formatter: (value) => new Date(value).toLocaleDateString(),
    },{
      key: "statut",
      label: "Statut",
      sortable: true,
      filterable: true,
    }
  ];
  
  // Fetch data from your API
  const fetchMembres = async () => {
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
  
      const response = await api.get("/membres",params);
  
      console.log(response);
  
      // Handle your API response structure
      if (response.success) {
        membres.value = response.data || [];
        store.state.membres = response.data || [];
      } else {
        console.error("API Error:", response.message);
      }
    } catch (error) {
      console.error("Error fetching membres:", error);
    } finally {
      loading.value = false;
    }
  };
  
  const getClassByStatut = (statut) => {
    if (statut === "actif") {
      return "bg-success";
    } else if (statut === "inactif") {
      return "bg-danger";
    } else if (statut === "suspendu") {
      return "bg-warning";
    } else {
      return "bg-secondary";
    }
  }
  
  // Event handlers
  const handleSearch = (searchTerm) => {
    queryParams.value.search = searchTerm;
    queryParams.value.page = 1;
    fetchMembres();
  };
  
  const handleSort = (sortData) => {
    queryParams.value.sort_field = sortData.field;
    queryParams.value.sort_order = sortData.order;
    queryParams.value.page = 1;
    fetchMembres();
  };
  
  const handleFilter = (filters) => {
    queryParams.value.filters = filters;
    queryParams.value.page = 1;
    fetchMembres();
  };
  
  const handlePageChange = (page) => {
    queryParams.value.page = page;
    fetchMembres();
  };
  
  const handlePerPageChange = (perPage) => {
    queryParams.value.per_page = perPage;
    queryParams.value.page = 1;
    fetchMembres();
  };
  
  const handleEdit = (membre) => {
    router.push({ name: 'membersEdit', params: { id: membre.id } });
  };

  const handleView = (membre) => {
    router.push({ name: 'memberView', params: { id: membre.id } });
  };
  
  const handleDelete = (membre) => {
    if(confirm("Etês-vous sûr de vouloir supprimer ce membre?")){
      api.delete(`/membres/${membre.id}`)
      .then((response) => {
        console.log("Membre supprimé avec succès!");
        fetchMembres();
      })
      .catch((error) => {
        console.error("Une erreur est survenue lors de la suppression du membre:", error);
      });
    }
  };
  
  onMounted(() => {
    fetchMembres();
  });
  
  const tableData = computed(() => {
    return store.state.membres || [];
  });
  </script>
  