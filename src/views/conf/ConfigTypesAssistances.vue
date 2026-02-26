<template>
  <div class="container-fluid py-4 px-4">
    <div
      class="d-flex justify-content-between align-items-center mb-4 animate-fade-in"
    >
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'configHub' }"
                >Configuration</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Types Assistances
            </li>
          </ol>
        </nav>
        <h2 class="fw-bold text-dark">Types d'Assistances</h2>
      </div>
      <div class="d-flex gap-2">
        <router-link
          :to="{ name: 'configHub' }"
          class="btn btn-outline-secondary rounded-pill px-4"
        >
          <i class="bi bi-arrow-left me-2"></i>Retour
        </router-link>
        <button
          class="btn btn-info rounded-pill px-4 text-white"
          @click="openModal()"
        >
          <i class="bi bi-plus-lg me-2"></i>Nouveau Type
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm custom-card animate-slide-up">
      <div class="card-body p-0">
        <AdvancedTable
          :data="tableData"
          :columns="columns"
          :loading="loading"
          search-placeholder="Rechercher un type d'assistance..."
          no-data-message="Aucun type d'assistance trouvé"
          :show-filters="false"
          :has-actions="true"
          row-key="id"
          @edit="openModal"
          @delete="removeConfig"
        >
          <template #column-nom="{ value }">
            <span class="fw-bold text-dark">{{ value }}</span>
          </template>

          <template #column-montant_standard="{ value }">
            <span class="fw-bold text-info">{{ formatAmount(value) }} FBU</span>
          </template>

          <template #column-conditions="{ value }">
            <div class="text-truncate" style="max-width: 250px" :title="value">
              {{ value || "-" }}
            </div>
          </template>

          <template #actions="{ item }">
            <div
              class="btn-group shadow-sm rounded-pill overflow-hidden border"
            >
              <button
                class="btn btn-white btn-sm px-3 hover-primary"
                @click="openModal(item)"
                title="Modifier"
              >
                <i class="bi bi-pencil-square text-primary"></i>
              </button>
              <button
                class="btn btn-white btn-sm px-3 hover-danger border-start"
                @click="removeConfig(item)"
                title="Supprimer"
              >
                <i class="bi bi-trash3 text-danger"></i>
              </button>
            </div>
          </template>
        </AdvancedTable>
      </div>
    </div>

    <!-- Modal -->
    <div
      class="modal fade custom-modal"
      id="configModal"
      tabindex="-1"
      aria-hidden="true"
      ref="modalEl"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0 pe-4 pt-4">
            <h4 class="modal-title fw-bold">
              {{
                editing.id
                  ? "Modifier le type d'assistance"
                  : "Nouveau type d'assistance"
              }}
            </h4>
            <button
              type="button"
              class="btn-close shadow-none"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form @submit.prevent="saveConfig">
            <div class="modal-body p-4">
              <div class="mb-4">
                <label
                  class="form-label fw-bold small text-uppercase text-muted"
                  >Nom de l'Assistance</label
                >
                <input
                  v-model="editing.nom"
                  type="text"
                  class="form-control border-0 bg-light px-3 py-2"
                  placeholder="ex: Assistance Maladie"
                  required
                />
              </div>

              <div class="mb-4">
                <label
                  class="form-label fw-bold small text-uppercase text-muted"
                  >Montant Standard (FBU)</label
                >
                <div class="input-group">
                  <span class="input-group-text border-0 bg-light text-muted"
                    >FBU</span
                  >
                  <input
                    v-model="editing.montant_standard"
                    type="number"
                    class="form-control border-0 bg-light px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div class="mb-4">
                <label
                  class="form-label fw-bold small text-uppercase text-muted"
                  >Conditions d'attribution</label
                >
                <textarea
                  v-model="editing.conditions"
                  class="form-control border-0 bg-light px-3 py-2"
                  rows="3"
                  placeholder="Quelles sont les conditions pour en bénéficier ?"
                ></textarea>
              </div>

              <div class="mb-3">
                <label
                  class="form-label fw-bold small text-uppercase text-muted"
                  >Documents Requis</label
                >
                <textarea
                  v-model="editing.documents_requis"
                  class="form-control border-0 bg-light px-3 py-2"
                  rows="3"
                  placeholder="Listez les documents nécessaires..."
                ></textarea>
              </div>

              <div
                v-if="modalError"
                class="alert alert-danger-custom d-flex align-items-center mb-0 mt-3 border-0"
              >
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ modalError }}</div>
              </div>
            </div>

            <div class="modal-footer border-0 p-4 pt-0">
              <button
                type="button"
                class="btn btn-light rounded-pill px-4 fw-semibold"
                data-bs-dismiss="modal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn btn-info rounded-pill px-4 fw-bold text-white"
              >
                {{
                  editing.id ? "Enregistrer les modifications" : "Créer le type"
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
import api from "../../services/api";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import AdvancedTable from "../../components/advancedTable/AdvancedTable.vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const configs = ref([]);
const loading = ref(false);
const error = ref("");
const modalError = ref("");
const modalEl = ref(null);
let modalInstance = null;

const columns = [
  { key: "nom", label: "NOM", sortable: true },
  { key: "montant_standard", label: "MONTANT", sortable: true },
  { key: "conditions", label: "CONDITIONS", sortable: false },
  { key: "documents_requis", label: "DOCUMENTS", sortable: false },
];

const tableData = computed(() => {
  return {
    data: configs.value,
    total: configs.value.length,
    per_page: 999,
    current_page: 1,
    last_page: 1,
  };
});

const editing = ref({
  id: null,
  nom: "",
  montant_standard: 0,
  conditions: "",
  documents_requis: "",
});

onMounted(() => {
  fetchConfigs();
});

async function fetchConfigs() {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/type-assistances");
    configs.value = res.data ?? [];
  } catch (err) {
    console.error("fetchConfigs error", err);
    error.value = "Impossible de charger les types d'assistance.";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

function openModal(cfg = null) {
  modalError.value = "";
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalEl.value);
  }

  if (cfg) {
    editing.value = {
      id: cfg.id,
      nom: cfg.nom ?? "",
      montant_standard: cfg.montant_standard ?? 0,
      conditions: cfg.conditions ?? "",
      documents_requis: cfg.documents_requis ?? "",
    };
  } else {
    editing.value = {
      id: null,
      nom: "",
      montant_standard: 0,
      conditions: "",
      documents_requis: "",
    };
  }
  modalInstance.show();
}

async function saveConfig() {
  modalError.value = "";
  const payload = { ...editing.value };
  try {
    if (editing.value.id) {
      await api.put(`/type-assistances/${editing.value.id}`, payload);
      toast.success("Type d'assistance mis à jour");
    } else {
      await api.post("/type-assistances", payload);
      toast.success("Type d'assistance créé avec succès");
    }
    await fetchConfigs();
    modalInstance.hide();
  } catch (err) {
    console.error("saveConfig error", err);
    modalError.value =
      err?.response?.data?.message || "Erreur lors de l'enregistrement.";
  }
}

async function removeConfig(cfg) {
  if (!confirm(`Confirmer la suppression de "${cfg.nom}" ?`)) return;
  try {
    if (cfg.id) {
      await api.delete(`/type-assistances/${cfg.id}`);
      toast.success("Type d'assistance supprimé");
      configs.value = configs.value.filter((c) => c.id !== cfg.id);
    }
  } catch (err) {
    console.error("removeConfig error", err);
    toast.error("Erreur lors de la suppression.");
  }
}

const formatAmount = (val) => {
  return new Intl.NumberFormat("fr-BE").format(val);
};
</script>

<style scoped>
.custom-card {
  border-radius: 20px;
  overflow: hidden;
}
.custom-modal .modal-content {
  border-radius: 24px;
}
.alert-danger-custom {
  background-color: #fff5f5;
  color: #e53e3e;
  border-radius: 12px;
}
.hover-primary:hover {
  background-color: #f0f7ff !important;
}
.hover-danger:hover {
  background-color: #fff5f5 !important;
}
.btn-white {
  background-color: white;
  border: none;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}
.breadcrumb-item a {
  text-decoration: none;
  font-weight: 600;
  color: #6c757d;
}
.breadcrumb-item.active {
  font-weight: 600;
}
</style>
