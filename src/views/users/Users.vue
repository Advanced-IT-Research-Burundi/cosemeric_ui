<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Tous les utilisateurs</h2>
      <router-link to="/users/add" type="button" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>Ajouter un utilisateur
      </router-link>
    </div>

    <div class="card">
      <AdvancedTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        search-placeholder="Rechercher des utilisateurs..."
        no-data-message="Aucun utilisateur trouvé"
        :show-filters="true"
        :has-actions="true"
        row-key="id"
        model="users"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @search="handleSearch"
        @sort="handleSort"
        @filter="handleFilter"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Custom column slot for status -->
        <template #column-status="{ value }">
          <span class="badge rounded-1" :class="getClassByStatus(value)">
            {{
              (value || "").toString().charAt(0).toUpperCase() +
              (value || "").toString().slice(1)
            }}
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
import { useToast } from "vue-toastification";

const store = useStore();
const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const toast = useToast();

// Query params aligned with AllMembers.vue
const queryParams = ref({
  page: 1,
  per_page: 15,
  search: "",
  sort_field: "",
  sort_order: "asc",
  filters: {},
});

const columns = [
  { key: "name", label: "Nom complet", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Rôle", sortable: true, filterable: true },
  {
    key: "created_at",
    label: "Créé le",
    sortable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  { key: "status", label: "Statut", sortable: true, filterable: true },
];

const form = ref({
  id: null,
  full_name: "",
  email: "",
  role: "",
  status: "",
  password: "",
});

const resetForm = () => {
  form.value = {
    id: null,
    full_name: "",
    email: "",
    role: "",
    status: "",
    password: "",
  };
};

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {};
    params.page = queryParams.value.page;
    params.per_page = queryParams.value.per_page;
    if (queryParams.value.search) params.search = queryParams.value.search;
    if (queryParams.value.sort_field) {
      params.sort_field = queryParams.value.sort_field;
      params.sort_order = queryParams.value.sort_order;
    }
    Object.entries(queryParams.value.filters).forEach(([key, value]) => {
      if (value) params[`filter[${key}]`] = value;
    });

    // Adjust endpoint to your backend for users
    const response = await api.get("/users", params);

    if (response?.success) {
      users.value = response.data || [];
      store.state.users = response.data || [];
    } else if (Array.isArray(response)) {
      users.value = response;
      store.state.users = response;
    } else {
      users.value = response?.data || [];
      store.state.users = response?.data || [];
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

// Save (create/update)
const saveUser = async () => {
  try {
    saving.value = true;
    const payload = { ...form.value };
    if (isEditMode.value) {
      const id = payload.id;
      delete payload.id;
      if (!payload.password) delete payload.password;
      await api.put(`/users/${id}`, payload);
    } else {
      if (!payload.password) delete payload.password;
      await api.post("/users", payload);
    }
    await fetchUsers();
  } catch (error) {
    console.error("Error saving user:", error);
  } finally {
    saving.value = false;
  }
};

// Table handlers (mirror AllMembers.vue)
const handleSearch = (searchTerm) => {
  queryParams.value.search = searchTerm;
  queryParams.value.page = 1;
  fetchUsers();
};

const handleSort = (sortData) => {
  queryParams.value.sort_field = sortData.field;
  queryParams.value.sort_order = sortData.order;
  queryParams.value.page = 1;
  fetchUsers();
};

const handleFilter = (filters) => {
  queryParams.value.filters = filters;
  queryParams.value.page = 1;
  fetchUsers();
};

const handlePageChange = (page) => {
  queryParams.value.page = page;
  fetchUsers();
};

const handlePerPageChange = (perPage) => {
  queryParams.value.per_page = perPage;
  queryParams.value.page = 1;
  fetchUsers();
};

const handleEdit = (user) => {
  router.push({ name: 'usersEdit', params: { id: user.id } })
};

const handleView = (user) => {
  // You can navigate to a view route if needed:
  // router.push({ name: 'userView', params: { id: user.id } })
};

const handleDelete = (user) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
    api
      .delete(`/users/${user.id}`)
      .then(() => {
        fetchUsers()
        toast.success("Utilisateur supprimé avec succès");
      })
      .catch((error) => console.error("Delete user error:", error));
  }
};

const getClassByStatus = (status) => {
  if (status === "active" || status === "actif") return "bg-success";
  if (status === "inactive" || status === "inactif") return "bg-danger";
  if (status === "suspended" || status === "suspendu") return "bg-warning";
  return "bg-secondary";
};

onMounted(() => {
  fetchUsers();
});

const tableData = computed(() => {
  return store.state.users || users.value || [];
});
</script>




<script setup >

</script>


<style  scoped>

</style>