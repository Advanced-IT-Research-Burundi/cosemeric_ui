<template>
  <div class="container-fluid mt-4">
    <div class="row" v-if="credit">
      <!-- Member Information Card -->
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-light fw-bold text-primary">
            <i class="bi bi-person-badge me-2"></i>Information Membre
          </div>
          <div class="card-body text-center" v-if="credit.membre">
            <div
              class="avatar-placeholder mb-3 mx-auto bg-primary text-white d-flex align-items-center justify-content-center rounded-circle"
              style="width: 80px; height: 80px; font-size: 2rem"
            >
              {{ credit.membre.nom.charAt(0)
              }}{{ credit.membre.prenom.charAt(0) }}
            </div>
            <h5 class="card-title">{{ credit.membre.full_name }}</h5>
            <p class="text-muted mb-1">{{ credit.membre.matricule }}</p>
            <hr />
            <div class="text-start">
              <p class="mb-2">
                <i class="bi bi-telephone me-2 text-muted"></i>
                {{ credit.membre.telephone }}
              </p>
              <p class="mb-2">
                <i class="bi bi-envelope me-2 text-muted"></i>
                {{ credit.membre.email }}
              </p>
              <p class="mb-0">
                <i class="bi bi-geo-alt me-2 text-muted"></i> Catégorie:
                {{ credit.membre.categorie_id }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Credit Details Card -->
      <div class="col-md-8 mb-3">
        <div class="card shadow-sm border-0 h-100">
          <div
            class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0 text-primary fw-bold">
              <i class="bi bi-cash-stack me-2"></i>Détails du Crédit
            </h5>
            <span
              class="badge rounded-pill"
              :class="getStatusBadge(credit.statut)"
            >
              {{ formatStatus(credit.statut) }}
            </span>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block uppercase"
                    >Montant Demandé</small
                  >
                  <span class="fw-bold fs-5">{{
                    formatCurrency(credit.montant_demande)
                  }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded">
                  <small class="text-muted d-block uppercase"
                    >Montant Accordé</small
                  >
                  <span class="fw-bold fs-5 text-success">{{
                    formatCurrency(credit.montant_accorde)
                  }}</span>
                </div>
              </div>

              <div class="col-md-4">
                <label class="text-muted text-small">Taux d'intérêt</label>
                <p class="fw-bold">{{ credit.taux_interet }}%</p>
              </div>
              <div class="col-md-4">
                <label class="text-muted text-small">Durée</label>
                <p class="fw-bold">{{ credit.duree_mois }} mois</p>
              </div>
              <div class="col-md-4">
                <label class="text-muted text-small">Mensualité estimée</label>
                <p class="fw-bold">
                  {{ formatCurrency(credit.montant_mensualite) }}
                </p>
              </div>

              <div class="col-md-6">
                <label class="text-muted text-small"
                  >Montant Total à Rembourser</label
                >
                <p class="fw-bold text-dark">
                  {{ formatCurrency(credit.montant_total_rembourser) }}
                </p>
              </div>
              <div class="col-md-6">
                <label class="text-muted text-small">Montant Restant</label>
                <p class="fw-bold text-danger">
                  {{ formatCurrency(credit.montant_restant) }}
                </p>
              </div>

              <div class="col-12">
                <hr class="my-2" />
              </div>

              <div class="col-md-6">
                <small class="text-muted"
                  ><i class="bi bi-calendar-event me-1"></i> Date Demande</small
                >
                <p>{{ formatDate(credit.date_demande) }}</p>
              </div>
              <div class="col-md-6" v-if="credit.date_approbation">
                <small class="text-muted"
                  ><i class="bi bi-check-circle me-1"></i> Date
                  Approbation</small
                >
                <p>{{ formatDate(credit.date_approbation) }}</p>
              </div>

              <div class="col-md-6" v-if="credit.date_fin">
                <small class="text-muted"
                  ><i class="bi bi-check-circle me-1"></i> Date Fin</small
                >
                <p>{{ formatDate(credit.date_fin) }}</p>
              </div>

              <div class="col-12" v-if="credit.motif">
                <label class="fw-bold mb-1">Motif</label>
                <p class="bg-light p-2 rounded fst-italic mb-0">
                  {{ credit.motif }}
                </p>
              </div>

              <div class="col-12" v-if="credit.commentaire">
                <label class="fw-bold mb-1">Commentaire</label>
                <p class="bg-light p-2 rounded fst-italic mb-0">
                  {{ credit.commentaire }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Remboursements (nouveau) -->
      <div class="col-12 mt-3" v-if="credit">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-primary fw-bold">
              <i class="bi bi-wallet2 me-2"></i>Remboursements (nouveau)
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-3">
                <div class="p-3 bg-light rounded h-100">
                  <small class="text-muted d-block uppercase">Montant total endetté</small>
                  <span class="fw-bold fs-6">{{
                    formatCurrency(credit.montant_total_endette || credit.montant_total_rembourser)
                  }}</span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="p-3 bg-light rounded h-100">
                  <small class="text-muted d-block uppercase">Montant déjà payé</small>
                  <span class="fw-bold fs-6 text-success">{{
                    formatCurrency(credit.montant_deja_paye)
                  }}</span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="p-3 bg-light rounded h-100">
                  <small class="text-muted d-block uppercase">Échéances restantes</small>
                  <span class="fw-bold fs-6">{{ credit.echeances_restantes ?? '-' }}</span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="p-3 bg-light rounded h-100">
                  <small class="text-muted d-block uppercase">Retards & pénalités</small>
                  <span class="fw-bold fs-6 text-danger">
                    {{ credit.echeances_en_retard ?? 0 }} /
                    {{ formatCurrency(credit.total_penalites) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="table-responsive" v-if="credit.remboursements && credit.remboursements.length">
              <table class="table table-sm table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date échéance</th>
                    <th>Montant prévu</th>
                    <th>Montant payé</th>
                    <th>Date paiement</th>
                    <th>Statut</th>
                    <th>Pénalité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="echeance in credit.remboursements" :key="echeance.id">
                    <td>{{ echeance.numero_echeance }}</td>
                    <td>{{ formatDate(echeance.date_echeance) }}</td>
                    <td>{{ formatCurrency(echeance.montant_prevu) }}</td>
                    <td>{{ formatCurrency(echeance.montant_paye) }}</td>
                    <td>{{ echeance.date_paiement ? formatDate(echeance.date_paiement) : '-' }}</td>
                    <td>
                      <span class="badge rounded-pill" :class="getRemboursementStatusBadge(echeance.statut)">
                        {{ echeance.statut.toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ formatCurrency(echeance.penalite) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="d-flex justify-content-center align-items-center"
      style="min-height: 200px"
    >
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();

const credit = computed(() => store.state.credit);

const formatCurrency = (value) => {
  if (!value) return "0 FBU";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "BIF",
  }).format(value);
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

const getStatusBadge = (status) => {
  switch (status) {
    case "en_attente":
      return "bg-warning text-dark";
    case "approuve":
      return "bg-success";
    case "rejete":
      return "bg-danger";
    case "paye":
      return "bg-info";
    default:
      return "bg-secondary";
  }
};

const getRemboursementStatusBadge = (status) => {
  switch (status) {
    case "prevu":
      return "bg-secondary";
    case "paye":
      return "bg-success";
    case "en_retard":
      return "bg-danger";
    default:
      return "bg-light text-dark";
  }
};

onMounted(async () => {
  try {
    const response = await api.get(`/credits/${route.params.id}`);
    store.state.credit = response.data;
  } catch (error) {
    console.error("Erreur lors du chargement du crédit:", error);
  }
});
</script>

<style scoped>
.text-small {
  font-size: 0.85rem;
}
.avatar-placeholder {
  background: linear-gradient(45deg, #0d6efd, #0dcaf0);
}
</style>
