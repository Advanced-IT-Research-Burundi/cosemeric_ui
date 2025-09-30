<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Tous les utilisateurs</h2>
      <button type="button" class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus me-2"></i>Ajouter un utilisateur
      </button>
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

    <!-- Add/Edit User Modal -->
    <div
      class="modal fade"
      id="userModal"
      tabindex="-1"
      aria-labelledby="userModalLabel"
      aria-hidden="true"
      ref="userModalEl"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userModalLabel">
              {{
                isEditMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"
              }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nom complet</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="form.full_name"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    v-model.trim="form.email"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Rôle</label>
                  <select class="form-select" v-model="form.role" required>
                    <option value="">Sélectionner un rôle</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">Utilisateur</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Statut</label>
                  <select class="form-select" v-model="form.status" required>
                    <option value="">Sélectionner un statut</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>

                <div v-if="!isEditMode" class="col-12">
                  <label class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="form.password"
                    minlength="6"
                    :required="!isEditMode"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{
                  saving
                    ? "Enregistrement..."
                    : isEditMode
                    ? "Enregistrer"
                    : "Créer"
                }}
              </button>
            </div>
          </form>
        </div>
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

const store = useStore();
const users = ref([]);
const loading = ref(false);
const saving = ref(false);

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
  { key: "full_name", label: "Nom complet", sortable: true },
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

// Modal state
const userModalEl = ref(null);
let userModal = null;
const isEditMode = ref(false);
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

const openAddModal = () => {
  isEditMode.value = false;
  resetForm();
  userModal?.show();
};

const openEditModal = (user) => {
  isEditMode.value = true;
  form.value = {
    id: user.id,
    full_name: user.full_name || user.name || "",
    email: user.email || "",
    role: user.role || "",
    status: user.status || "",
    password: "",
  };
  userModal?.show();
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
    userModal?.hide();
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
  openEditModal(user);
};

const handleView = (user) => {
  // You can navigate to a view route if needed:
  // router.push({ name: 'userView', params: { id: user.id } })
  openEditModal(user);
};

const handleDelete = (user) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
    api
      .delete(`/users/${user.id}`)
      .then(() => fetchUsers())
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
  // Bootstrap 5 modal from bundle in main.js
  if (typeof window !== "undefined" && window.bootstrap) {
    userModal = new window.bootstrap.Modal(userModalEl.value, {
      backdrop: "static",
    });
  }
  fetchUsers();
});

const tableData = computed(() => {
  return store.state.users || users.value || [];
});
</script>


<template>
    <div>
        <advanced-table/>
    </div>
</template>

<script setup >

</script>


<style  scoped>

</style>