<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div
        class="card-header d-flex justify-content-between align-items-center bg-primary text-white"
      >
        <h4 class="mb-0">
          <i class="bi bi-gear-fill me-2"></i>Configuration - assistance
        </h4>
        <div>
          <button class="btn btn-light btn-sm" @click="openModal()">
            <i class="bi bi-plus-lg me-1"></i>Nouvelle
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="configs.length === 0" class="text-muted text-center py-4">
          Aucune configuration trouvée.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>nom</th>
                <th>Valeur</th>
                <!-- <th>Label</th> -->
                <!-- <th>Extra1</th>
                <th>Extra2</th> -->
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in configs" :key="c.id || c.key || i">
                <td>{{ i + 1 }}</td>
                <td>{{ c.nom }}</td>
                <td>{{ c.montant_standard }}</td>
                <!-- <td>{{ c.label }}</td> -->
                <!-- <td>{{ c.extra1 ?? "" }}</td>
                <td>{{ c.extra2 ?? "" }}</td> -->
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openModal(c)"
                  >
                    Modifier
                  </button>
                  <!-- <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeConfig(c)"
                  >
                    Supprimer
                  </button> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 d-flex justify-content-between">
          <small class="text-muted">Total: {{ configs.length }}</small>
          <button class="btn btn-secondary btn-sm" @click="fetchConfigs">
            Rafraîchir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      class="modal fade"
      id="configModal"
      tabindex="-1"
      aria-hidden="true"
      ref="modalEl"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-secondary text-white">
            <h5 class="modal-title">
              {{
                editing.id ? "Modifier configuration" : "Nouvelle configuration"
              }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form @submit.prevent="saveConfig">
            <div class="modal-body">
              <!-- <div class="mb-3">
                <label class="form-label">Clé (key)</label>
                <input
                  v-model="editing.key"
                  :disabled="editing.id"
                  required
                  type="text"
                  class="form-control"
                />
                <div class="form-text">
                  Identifiant unique (ex: taux_change_usd_bif).
                </div>
              </div> -->

              <div class="mb-3">
                <label class="form-label">nom</label>
                <input v-model="editing.nom" type="text" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Valeur</label>
                <input
                  v-model="editing.montant_standard"
                  type="number"
                  class="form-control"
                />
                <!-- <div class="form-text">Valeur (peut être vide / NULL).</div> -->
              </div>

              <!-- <div class="row g-2">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Extra1</label>
                  <input
                    v-model="editing.extra1"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Extra2</label>
                  <input
                    v-model="editing.extra2"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div> -->

              <div v-if="modalError" class="alert alert-danger mt-2">
                {{ modalError }}
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
              <button type="submit" class="btn btn-primary">
                {{ editing.id ? "Enregistrer" : "Créer" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useStore } from "vuex";

const store = useStore();
const configs = ref([]);
const error = ref("");
const modalError = ref("");
const modalEl = ref(null);
let modalInstance = null;

const editing = ref({
  id: null,
  key: "",
  value: "",
  label: "",
  //   extra1: null,
  //   extra2: null,
});

onMounted(() => {
  fetchConfigs();
});

async function fetchConfigs() {
  error.value = "";
  try {
    const res = await api.get("/type-assistances");
    // normalize possible shapes: res.data.data (paginated) or res.data
    store.state.configurations = res.data ?? null;
    configs.value = store.state.configurations;
    console.log("Fetched configs", configs.value);
  } catch (err) {
    console.error("fetchConfigs error", err);
    error.value = "Impossible de charger les configurations.";
    configs.value = [];
  }
}

function openModal(cfg = null) {
  modalError.value = "";
  if (!modalInstance) {
    const el = document.getElementById("configModal");
    modalInstance = new bootstrap.Modal(el);
  }
  if (cfg) {
    editing.value = {
      id: cfg.id,
      key: cfg.key,
      value: cfg.value,
      label: cfg.label,
      //   extra1: cfg.extra1 ?? null,
      //   extra2: cfg.extra2 ?? null,
    };
  } else {
    editing.value = {
      id: null,
      key: "",
      value: "",
      label: "",
      //   extra1: null,
      //   extra2: null,
    };
  }
  modalInstance.show();
}

async function saveConfig() {
  modalError.value = "";
  try {
    const payload = {
      montant_standard: editing.value.montant_standard || null,
      nom: editing.value.nom || null,
      //   extra1: editing.value.extra1 || null,
      //   extra2: editing.value.extra2 || null,
    };

    if (editing.value.id) {
      // update
      await api.put(`/type-assistances/${editing.value.id}`, payload);
    } else {
      // create
      console.log(payload);
      await api.post("/type-assistances", payload);
    }

    await fetchConfigs();
    if (modalInstance) modalInstance.hide();
  } catch (err) {
    console.error("saveConfig error", err);
    modalError.value =
      err?.response?.data?.message || "Erreur lors de l'enregistrement.";
  }
}

async function removeConfig(cfg) {
  if (!confirm(`Confirmer la suppression de "${cfg.key}" ?`)) return;
  try {
    if (cfg.id) await api.delete(`/type-assistances/${cfg.id}`);
    // optimistic remove locally
    configs.value = configs.value.filter(
      (c) => c.id !== cfg.id && c.key !== cfg.key
    );
  } catch (err) {
    console.error("removeConfig error", err);
    alert("Erreur lors de la suppression.");
  }
}
</script>

<style scoped>
.card {
  border-radius: 10px;
  border: none;
}
.card-header {
  border-radius: 10px 10px 0 0;
  padding: 0.75rem 1rem;
}
.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}
.form-label {
  font-weight: 600;
}
.modal-content {
  border-radius: 10px;
  border: none;
}
</style>
