<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Détails de la cotisation</h2>
      <router-link to="/contributions" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour à la liste
      </router-link>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
    </div>

    <!-- Content -->
    <div v-else>
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-light fw-bold">Informations principales</div>
        <div class="card-body">
          <div class="row mb-2">
            <div class="col-md-6">
              <strong>Membre :</strong>
              {{ contribution.membre?.nom || "Non défini" }}
            </div>
            <div class="col-md-6">
              <strong>Montant :</strong>
              {{ formatMontant(contribution.montant) }}
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-md-6">
              <strong>Mode de paiement :</strong>
              {{ getModePaiement(contribution.mode_paiement) }}
            </div>
            <div class="col-md-6">
              <strong>Statut :</strong>
              <span
                class="badge rounded-1"
                :class="getClassByStatut(contribution.statut)"
              >
                {{ ucFirst(contribution.statut) }}
              </span>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-md-6">
              <strong>Date de création :</strong>
              {{ formatDate(contribution.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header bg-light fw-bold">Détails supplémentaires</div>
        <div class="card-body">
          <p><strong>Observations :</strong></p>
          <p>{{ contribution.observations || "Aucune observation" }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../services/api";

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const contribution = ref({});
const loading = ref(false);
const error = ref(null);

// 🔹 Fonctions utilitaires
const formatMontant = (montant) => {
  if (!montant) return "0 FBU";
  return new Intl.NumberFormat("fr-FR").format(montant) + " FBU";
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR");
};

const getModePaiement = (mode) => {
  const modes = {
    1: "Espèces",
    2: "Virement",
    3: "Chèque",
    4: "Mobile Money",
  };
  return modes[mode] || "Inconnu";
};

const getClassByStatut = (statut) => {
  switch (statut) {
    case "paye":
      return "bg-success";
    case "en_attente":
      return "bg-warning";
    case "en_retard":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const ucFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 🔹 Fetch de la cotisation
const fetchContribution = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/cotisations/${id}`);
    contribution.value = response.data;
  } catch (err) {
    console.error("Erreur:", err);
    error.value = "Impossible de charger la cotisation.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchContribution();
});
</script>

<style scoped>
.card {
  border-radius: 12px;
}
.card-header {
  font-size: 1rem;
}
</style>
