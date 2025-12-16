<template>
  <div
    v-if="modelValue"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    @click.self="close"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-info-circle me-2 text-primary"></i>
            {{ title || "Détails" }}
          </h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>

          <div v-else-if="error" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
          </div>

          <div v-else-if="data" class="details-content">
            <!-- Cotisations -->
            <div
              v-if="endpoint.includes('cotisations')"
              class="details-section"
            >
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="text-muted small">Membre</label>
                  <p class="fw-bold">
                    {{ data.membre?.prenom }} {{ data.membre?.nom }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Période</label>
                  <p class="fw-bold">
                    {{ data.periode?.libelle }} ({{ data.periode?.annee }})
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Montant</label>
                  <p class="fw-bold fs-5 text-primary">
                    {{ formatCurrency(data.montant, data.devise) }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Date de paiement</label>
                  <p class="fw-bold">{{ formatDate(data.date_paiement) }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Mode de paiement</label>
                  <p class="fw-bold">
                    {{ getModePaiement(data.mode_paiement) }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Référence</label>
                  <p class="fw-bold">{{ data.reference_paiement || "-" }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Statut</label>
                  <div>
                    <span class="badge" :class="getStatusBadge(data.statut)">{{
                      formatStatus(data.statut)
                    }}</span>
                  </div>
                </div>
                <div class="col-12" v-if="data.notes">
                  <label class="text-muted small">Notes</label>
                  <div class="p-3 bg-light rounded text-dark border">
                    {{ data.notes }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Périodes -->
            <div
              v-else-if="endpoint.includes('periodes')"
              class="details-section"
            >
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="text-muted small">Libellé</label>
                  <p class="fw-bold">{{ data.libelle }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Type</label>
                  <p class="fw-bold text-capitalize">{{ data.type }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Année</label>
                  <p class="fw-bold">{{ data.annee }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Statut</label>
                  <div>
                    <span
                      class="badge"
                      :class="
                        data.statut === 'ouvert' ? 'bg-success' : 'bg-secondary'
                      "
                    >
                      {{ data.statut === "ouvert" ? "Ouvert" : "Fermé" }}
                    </span>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Date de début</label>
                  <p class="fw-bold">{{ formatDate(data.date_debut) }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Date de fin</label>
                  <p class="fw-bold">{{ formatDate(data.date_fin) }}</p>
                </div>
              </div>
            </div>

            <!-- Assistances -->
            <div
              v-else-if="endpoint.includes('assistances')"
              class="details-section"
            >
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="text-muted small">Bénéficiaire</label>
                  <p class="fw-bold">
                    {{ data.membre?.prenom }} {{ data.membre?.nom }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Type d'assistance</label>
                  <p class="fw-bold">{{ data.type_assistance?.nom }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Montant</label>
                  <p class="fw-bold fs-5 text-primary">
                    {{ formatCurrency(data.montant, "FBU") }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Date de demande</label>
                  <p class="fw-bold">
                    {{ formatDate(data.date_demande || data.created_at) }}
                  </p>
                </div>
                <div class="col-md-6" v-if="data.date_versement">
                  <label class="text-muted small">Date de versement</label>
                  <p class="fw-bold">{{ formatDate(data.date_versement) }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Statut</label>
                  <div>
                    <span
                      class="badge"
                      :class="getAssistanceStatusBadge(data.statut)"
                      >{{ formatStatus(data.statut) }}</span
                    >
                  </div>
                </div>
                <div class="col-12" v-if="data.description">
                  <label class="text-muted small">Description</label>
                  <div class="p-3 bg-light rounded text-dark border">
                    {{ data.description }}
                  </div>
                </div>
                <div class="col-12" v-if="data.commentaire_admin">
                  <label class="text-muted small">Note Admin</label>
                  <div class="p-3 bg-light rounded text-dark border">
                    {{ data.commentaire_admin }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Credits -->
            <div
              v-else-if="endpoint.includes('credits')"
              class="details-section"
            >
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="text-muted small">Demandeur</label>
                  <p class="fw-bold">
                    {{ data.membre?.prenom }} {{ data.membre?.nom }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Montant demandé</label>
                  <p class="fw-bold fs-5 text-primary">
                    {{ formatCurrency(data.montant_demande, "FBU") }}
                  </p>
                </div>
                <div class="col-md-6" v-if="data.montant_accorde">
                  <label class="text-muted small">Montant accordé</label>
                  <p class="fw-bold fs-5 text-success">
                    {{ formatCurrency(data.montant_accorde, "FBU") }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Taux d'intérêt</label>
                  <p class="fw-bold">{{ data.taux_interet }}%</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Date de demande</label>
                  <p class="fw-bold">{{ formatDate(data.date_demande) }}</p>
                </div>
                <div class="col-md-6" v-if="data.date_remboursement_prevue">
                  <label class="text-muted small">Remboursement prévu</label>
                  <p class="fw-bold">
                    {{ formatDate(data.date_remboursement_prevue) }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Statut</label>
                  <div>
                    <span class="badge" :class="getStatusBadge(data.statut)">{{
                      formatStatus(data.statut)
                    }}</span>
                  </div>
                </div>
                <div class="col-12" v-if="data.motif">
                  <label class="text-muted small">Motif</label>
                  <div class="p-3 bg-light rounded text-dark border">
                    {{ data.motif }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Remboursements -->
            <div
              v-else-if="endpoint.includes('remboursements')"
              class="details-section"
            >
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="text-muted small">Crédit ID</label>
                  <p class="fw-bold">#{{ data.credit_id }}</p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Montant Remboursé</label>
                  <p class="fw-bold fs-5 text-success">
                    {{ formatCurrency(data.montant, "FBU") }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Date</label>
                  <p class="fw-bold">
                    {{ formatDate(data.date_remboursement) }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Note</label>
                  <p class="fw-bold">{{ data.note || "-" }}</p>
                </div>
              </div>
            </div>

            <!-- Fallback Generic -->
            <div v-else class="details-section">
              <div class="table-responsive">
                <table class="table table-bordered">
                  <tbody>
                    <tr v-for="(value, key) in filteredData" :key="key">
                      <th class="bg-light text-capitalize">
                        {{ formatKey(key) }}
                      </th>
                      <td>{{ formatValue(value) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary" @click="close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="modelValue" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import api from "../../services/api";

const props = defineProps({
  modelValue: Boolean,
  endpoint: {
    type: String,
    required: true,
  },
  itemId: {
    type: [Number, String],
    default: null,
  },
  title: String,
});

const emit = defineEmits(["update:modelValue"]);

const data = ref(null);
const loading = ref(false);
const error = ref("");

const close = () => {
  emit("update:modelValue", false);
};

const fetchData = async () => {
  if (!props.itemId) return;

  loading.value = true;
  error.value = "";
  data.value = null;

  try {
    const response = await api.get(`/${props.endpoint}/${props.itemId}`);
    // Handle different API response structures (e.g. { data: ... } or just { ... })
    data.value = response.data.data || response.data || response;
  } catch (err) {
    console.error(`Error fetching ${props.endpoint} details:`, err);
    error.value = "Impossible de charger les détails. Veuillez réessayer.";
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      fetchData();
    } else {
      data.value = null; // Clear on close
    }
  }
);

watch(
  () => props.itemId,
  () => {
    if (props.modelValue) {
      fetchData();
    }
  }
);

// Formatters
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount, currency = "FBU") => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatStatus = (status) => {
  if (!status) return "-";
  const map = {
    en_attente: "En attente",
    paye: "Payé",
    en_retard: "En retard",
    ouvert: "Ouvert",
    ferme: "Fermé",
    rejete: "Rejeté",
    en_cours: "En cours",
    approuve: "Approuvé",
    termine: "Terminé",
  };
  return map[status] || status;
};

const getStatusBadge = (status) => {
  const map = {
    paye: "bg-success",
    approuve: "bg-success",
    ouvert: "bg-success",
    termine: "bg-success",
    en_attente: "bg-warning",
    en_cours: "bg-info",
    en_retard: "bg-danger",
    rejete: "bg-danger",
    ferme: "bg-secondary",
  };
  return map[status] || "bg-secondary";
};

const getAssistanceStatusBadge = (status) => {
  return getStatusBadge(status);
};

const getModePaiement = (mode) => {
  const modes = {
    1: "Espèces",
    2: "Virement",
    3: "Chèque",
    4: "Mobile Money",
  };
  return modes[mode] || mode || "-";
};

// Generic Fallback
const filteredData = computed(() => {
  if (!data.value) return {};
  const ignoredKeys = [
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "membre_id",
    "periode_id",
  ];
  return Object.fromEntries(
    Object.entries(data.value).filter(
      ([key]) =>
        !ignoredKeys.includes(key) && typeof data.value[key] !== "object"
    )
  );
});

const formatKey = (key) => {
  return key.replace(/_/g, " ");
};

const formatValue = (val) => {
  if (typeof val === "boolean") return val ? "Oui" : "Non";
  return val;
};
</script>

<style scoped>
.modal-dialog {
  max-width: 700px;
}
</style>
