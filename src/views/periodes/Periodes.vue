<template>
  <div class="">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Périodes</h2>
      <button
        class="btn btn-primary"
        @click="openAdd"
        v-if="auth.hasAnyRole('admin')"
      >
        <i class="fas fa-plus me-2"></i>Nouvelle période
      </button>
    </div>

    <div class="card">
      <AdvancedTable
        :data="periodes"
        :columns="columns"
        :loading="loading"
        search-placeholder="Rechercher des périodes..."
        no-data-message="Aucune période trouvée"
        :show-filters="false"
        :has-actions="true"
        row-key="id"
        @edit="openEdit"
        @delete="handleDelete"
        @search="handleSearch"
        @sort="handleSort"
        @filter="handleFilter"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
      </AdvancedTable>
    </div>

    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEdit ? "Modifier la période" : "Nouvelle période" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="error" class="alert alert-danger mb-3">{{ error }}</div>
            <form @submit.prevent="save">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >Type <span class="text-danger">*</span></label
                  >
                  <select class="form-select" v-model="form.type" required>
                    <option value="mensuel">Mensuel</option>
                    <option value="semestriel">Semestriel</option>
                  </select>
                </div>

                <div class="col-md-6" v-if="form.type === 'mensuel'">
                  <label class="form-label"
                    >Mois <span class="text-danger">*</span></label
                  >
                  <select
                    class="form-select"
                    v-model.number="form.mois"
                    required
                  >
                    <option
                      v-for="(m, idx) in months"
                      :key="idx"
                      :value="idx + 1"
                    >
                      {{ m }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6" v-if="form.type === 'semestriel'">
                  <label class="form-label"
                    >Semestre <span class="text-danger">*</span></label
                  >
                  <select
                    class="form-select"
                    v-model.number="form.semestre"
                    required
                  >
                    <option :value="1">1er semestre</option>
                    <option :value="2">2ème semestre</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >Année <span class="text-danger">*</span></label
                  >
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="form.annee"
                    min="2000"
                    max="2100"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >Statut <span class="text-danger">*</span></label
                  >
                  <select class="form-select" v-model="form.statut" required>
                    <option value="ouvert">Ouvert</option>
                    <option value="ferme">Ferme</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >Date de début <span class="text-danger">*</span></label
                  >
                  <Datepicker
                    v-model="form.date_debut"
                    :enable-time-picker="false"
                    :auto-apply="true"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >Date de fin <span class="text-danger">*</span></label
                  >
                  <Datepicker
                    v-model="form.date_fin"
                    :enable-time-picker="false"
                    :auto-apply="true"
                  />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="closeModal"
              :disabled="saving"
            >
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="save"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ saving ? "Enregistrement..." : "Enregistrer" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import api from "../../services/api";
import AdvancedTable from "../../components/advancedTable/AdvancedTable.vue";
import useAuthStore from "../../stores/auth";

const auth = useAuthStore();
const periodes = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const store = useStore();
const toast = useToast();
const queryParams = ref({
  page: 1,
  per_page: 15,
  search: "",
  sort_field: "",
  sort_order: "asc",
  filters: {},
});

const months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const columns = [
  { key: "id", label: "id" },
  {
    key: "mois",
    label: "Mois",
    sortable: true,
    formatter: (v) => {
      if (typeof v !== "number") return "";
      return months[v - 1] ?? "don't know"; // <-- fixed
    },
  },

  {
    key: "semestre",
    label: "Semestre",
    sortable: true,
    formatter: (v) => semesterLabel(v),
  },
  { key: "annee", label: "Année", sortable: true, filterable: true },
  { key: "statut", label: "Statut", sortable: true, filterable: true },
  { key: "type", label: "Type", sortable: true, filterable: true },

  {
    key: "date_debut",
    label: "Début",
    sortable: true,
    formatter: (v) => (v ? new Date(v).toLocaleDateString() : ""),
  },
  {
    key: "date_fin",
    label: "Fin",
    sortable: true,
    formatter: (v) => (v ? new Date(v).toLocaleDateString() : ""),
  },
];

const monthLabel = (n) => (n && n >= 1 && n <= 12 ? months[n - 1] : "");
const semesterLabel = (s) =>
  s === 1 ? "1er semestre" : s === 2 ? "2ème semestre" : "";

const form = ref({
  id: null,
  type: "mensuel",
  mois: 1,
  semestre: 1,
  annee: new Date().getFullYear(),
  statut: "ouvert",
  date_debut: null,
  date_fin: null,
});

watch(
  () => [
    form.value.type,
    form.value.mois,
    form.value.semestre,
    form.value.annee,
  ],
  ([newType, newMois, newSemestre, newAnnee]) => {
    if (!newAnnee) return;

    const year = parseInt(newAnnee);

    if (newType === "mensuel" && newMois) {
      const monthIndex = parseInt(newMois) - 1;
      form.value.date_debut = new Date(year, monthIndex, 1);
      form.value.date_fin = new Date(year, monthIndex + 1, 0);
    } else if (newType === "semestriel" && newSemestre) {
      if (parseInt(newSemestre) === 1) {
        form.value.date_debut = new Date(year, 0, 1);
        form.value.date_fin = new Date(year, 5, 30);
      } else if (parseInt(newSemestre) === 2) {
        form.value.date_debut = new Date(year, 6, 1);
        form.value.date_fin = new Date(year, 11, 31);
      }
    }
  }
);
const showModal = ref(false);
const isEdit = ref(false);

const fetchPeriodes = async () => {
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
    const response = await api.get("/periodes", params);

    console.log(response);

    // Handle your API response structure
    if (response.success) {
      periodes.value = response.data || [];
      store.state.periodes = response.data || [];
    } else {
      console.error("API Error:", response.message);
    }
  } catch (error) {
    console.error("Error fetching periodes:", error);
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  isEdit.value = false;
  form.value = {
    id: null,
    type: "mensuel",
    mois: 1,
    semestre: 1,
    annee: new Date().getFullYear(),
    statut: "ouvert",
    date_debut: null,
    date_fin: null,
  };
  error.value = "";
  showModal.value = true;
};

const openEdit = (row) => {
  console.log(row);

  isEdit.value = true;
  // Assurez-vous que l'objet 'row' de l'API a les clés en français pour la fusion
  form.value = { ...row };
  error.value = "";
  showModal.value = true;
};

const closeModal = () => {
  if (!saving.value) showModal.value = false;
};

const save = async () => {
  saving.value = true;
  error.value = "";
  try {
    console.log(form.value);
    const payload = { ...form.value };

    alert(payload.value);

    if (payload.type === "mensuel") {
      payload.semestre = null;
    }
    if (payload.type === "semestriel") {
      payload.mois = null;
    }

    if (isEdit.value && payload.id) {
      await api.put(`/periodes/${payload.id}`, payload);
      toast.success("Période modifiée avec succès");
    } else {
      await api.post("/periodes", payload);
      toast.success("Période enregistrée avec succès");
    }
    await fetchPeriodes();
    showModal.value = false;
  } catch (e) {
    console.error("Error saving periode:", e);

    const apiErrors = e?.response?.data?.errors;
    if (apiErrors) {
      let errorMessages = e.response.data.message + "<br>";
      for (const key in apiErrors) {
        errorMessages += `**${key}**: ${apiErrors[key].join(", ")}<br>`;
      }
      error.value = errorMessages;
    } else {
      error.value =
        e?.response?.data?.message || "Erreur lors de l'enregistrement";
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (row) => {
  if (!confirm("Supprimer cette période ?")) return;
  try {
    await api.delete(`/periodes/${row.id}`);

    fetchPeriodes();
    toast.success("Période supprimée avec succès");
  } catch (e) {
    console.error(e);
    toast.error("Une erreur est survenue lors de la suppression de la période");
  }
};

const handleSearch = (term) => {
  queryParams.value.search = term;
  queryParams.value.page = 1;
  fetchPeriodes();
};
const handleSort = ({ field, order }) => {
  queryParams.value.sort_field = field;
  queryParams.value.sort_order = order;
  queryParams.value.page = 1;
  fetchPeriodes();
};
const handleFilter = (filters) => {
  queryParams.value.filters = filters;
  queryParams.value.page = 1;
  fetchPeriodes();
};
const handlePageChange = (page) => {
  queryParams.value.page = page;
  fetchPeriodes();
};
const handlePerPageChange = (per) => {
  queryParams.value.per_page = per;
  queryParams.value.page = 1;
  fetchPeriodes();
};

const tableData = computed(() => {
  return store.state.periodes;
});
onMounted(fetchPeriodes);
</script>
