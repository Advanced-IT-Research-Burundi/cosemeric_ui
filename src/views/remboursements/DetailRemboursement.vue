<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Détails du remboursement</h2>
      <button @click="$router.back()" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
    </div>

    <div v-else-if="credit">
      <!-- Top Summary Cards -->
      <div class="row mb-4">
        <div
          class="col-md-3"
          v-for="(card, index) in summaryCards"
          :key="index"
        >
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <div :class="['rounded-circle p-2 me-3', card.bgIcon]">
                  <i :class="[card.icon, card.textColor, 'fa-lg']"></i>
                </div>
                <small class="text-muted fw-bold text-uppercase">{{
                  card.title
                }}</small>
              </div>
              <h4 class="mb-0 fw-bold">{{ card.value }}</h4>
              <small v-if="card.subtext" class="text-muted">{{
                card.subtext
              }}</small>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Credit Info Card -->
        <div class="col-lg-7 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0">
              <h5 class="mb-0 fw-bold">Informations sur le crédit</h5>
            </div>
            <div class="card-body p-4 pt-0">
              <div class="row g-4">
                <div class="col-md-6 text-start">
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1">Membre</label>
                    <span class="fw-bold"
                      >{{ credit.membre?.nom }}
                      {{ credit.membre?.prenom }}</span
                    >
                    <small class="d-block text-muted"
                      >Matricule: {{ credit.membre?.matricule }}</small
                    >
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1"
                      >Montant Accordé</label
                    >
                    <span class="fw-bold text-success fs-5">{{
                      formatCurrency(credit.montant_accorde)
                    }}</span>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1"
                      >Taux d'intérêt</label
                    >
                    <span class="fw-bold">{{ credit.taux_interet }}%</span>
                  </div>
                </div>
                <div class="col-md-6 text-start">
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1">Durée</label>
                    <span class="fw-bold">{{ credit.duree_mois }} mois</span>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1"
                      >Mensualité</label
                    >
                    <span class="fw-bold">{{
                      formatCurrency(credit.montant_mensualite)
                    }}</span>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1"
                      >Date d'approbation</label
                    >
                    <span class="fw-bold">{{
                      formatDate(credit.date_approbation)
                    }}</span>
                  </div>
                </div>
                <div class="col-12 text-start" v-if="credit.motif">
                  <label class="text-muted small d-block mb-1">Motif</label>
                  <p class="mb-0 p-2 bg-light rounded fst-italic">
                    {{ credit.motif }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Card -->
        <div class="col-lg-5 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0">
              <h5 class="mb-0 fw-bold">Statut du remboursement</h5>
            </div>
            <div
              class="card-body p-4 pt-0 d-flex flex-column justify-content-center align-items-center"
            >
              <div class="mb-3">
                <span
                  class="badge rounded-pill px-4 py-2 fs-6"
                  :class="getStatusBadgeClass(credit.statut)"
                >
                  {{ formatStatus(credit.statut) }}
                </span>
              </div>
              <div class="w-100 mt-3">
                <div class="d-flex justify-content-between mb-1">
                  <small class="text-muted">Progression</small>
                  <small class="fw-bold">{{ progressPercentage }}%</small>
                </div>
                <div class="progress" style="height: 10px">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    :style="{ width: progressPercentage + '%' }"
                    aria-valuenow="progressPercentage"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <div class="row w-100 mt-4 text-center">
                <div class="col-6">
                  <div class="p-2 border rounded bg-light">
                    <small class="d-block text-muted">Payé</small>
                    <span class="fw-bold"
                      >{{ paidCount }} / {{ totalCount }}</span
                    >
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 border rounded bg-light">
                    <small class="d-block text-muted">En retard</small>
                    <span class="fw-bold text-danger">{{ lateCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mb-4">
          <ActivityList
            title="Calendrier des remboursements"
            :items="activityItems"
            emptyMessage="Aucune échéance générée"
            statusField="statusLabel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import ActivityList from "../../components/members/ActivityList.vue";

const route = useRoute();
const creditId = route.params.id;
const loading = ref(true);
const error = ref(null);
const credit = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "BIF",
  }).format(value || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatStatus = (status) => {
  if (!status) return "";
  return status.replace(/_/g, " ").toUpperCase();
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "approuve":
      return "bg-success-subtle text-success border border-success";
    case "en_cours":
      return "bg-primary-subtle text-primary border border-primary";
    case "termine":
      return "bg-info-subtle text-info border border-info";
    case "en_retard":
      return "bg-danger-subtle text-danger border border-danger";
    default:
      return "bg-secondary-subtle text-secondary border border-secondary";
  }
};

const summaryCards = computed(() => {
  if (!credit.value) return [];

  return [
    {
      title: "Montant Total",
      value: formatCurrency(credit.value.montant_total_rembourser),
      icon: "fas fa-money-bill-wave",
      textColor: "text-primary",
      bgIcon: "bg-primary-subtle",
    },
    {
      title: "Montant Payé",
      value: formatCurrency(credit.value.montant_deja_paye),
      icon: "fas fa-check-circle",
      textColor: "text-success",
      bgIcon: "bg-success-subtle",
      subtext: "Total des échéances payées",
    },
    {
      title: "Reste à payer",
      value: formatCurrency(credit.value.montant_restant),
      icon: "fas fa-clock",
      textColor: "text-warning",
      bgIcon: "bg-warning-subtle",
    },
    {
      title: "Pénalités",
      value: formatCurrency(credit.value.total_penalites),
      icon: "fas fa-exclamation-triangle",
      textColor: "text-danger",
      bgIcon: "bg-danger-subtle",
    },
  ];
});

const activityItems = computed(() => {
  if (!credit.value || !credit.value.remboursements) return [];

  return credit.value.remboursements
    .map((r) => ({
      title: `Échéance N°${r.numero_echeance}`,
      date: r.date_echeance,
      paymentDate: r.date_paiement,
      amount: formatCurrency(r.montant_prevu),
      statusLabel:
        r.statut === "paye"
          ? "Payée"
          : r.statut === "en_retard"
            ? "En retard"
            : "Prévue",
      status:
        r.statut === "paye"
          ? "Approuvée"
          : r.statut === "en_retard"
            ? "Refusée"
            : "En attente",
    }))
    .sort((a, b) => a.numero_echeance - b.numero_echeance);
});

const paidCount = computed(
  () =>
    credit.value?.remboursements?.filter((r) => r.statut === "paye").length ||
    0,
);
const totalCount = computed(() => credit.value?.remboursements?.length || 0);
const lateCount = computed(
  () =>
    credit.value?.remboursements?.filter((r) => r.statut === "en_retard")
      .length || 0,
);
const progressPercentage = computed(() =>
  totalCount.value > 0
    ? Math.round((paidCount.value / totalCount.value) * 100)
    : 0,
);

const fetchCreditDetails = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/credits/${creditId}`);
    credit.value = response.data;
  } catch (err) {
    console.error("Error fetching credit details:", err);
    error.value = "Impossible de charger les détails du crédit.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCreditDetails);
</script>

<style scoped>
.bg-primary-subtle {
  background-color: #e7f1ff;
}
.bg-success-subtle {
  background-color: #e6fcf5;
}
.bg-warning-subtle {
  background-color: #fff9db;
}
.bg-danger-subtle {
  background-color: #fff5f5;
}
.bg-info-subtle {
  background-color: #e3fafc;
}
.bg-secondary-subtle {
  background-color: #f8f9fa;
}
</style>
