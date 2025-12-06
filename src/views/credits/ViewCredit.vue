<template>
  <div class="container py-1">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Détails du Crédit</h2>

      <div>
        <router-link to="/credits/mescredits" class="btn btn-secondary me-2">
          <i class="fas fa-arrow-left me-2"></i>Retour
        </router-link>

        <router-link :to="{ name: 'creditsEdit', params: { id: credit.id } }" class="btn btn-primary me-2">
          <i class="fas fa-edit me-2"></i>Modifier
        </router-link>

        <button class="btn btn-danger" @click="handleDelete">
          <i class="fas fa-trash me-2"></i>Supprimer
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <!-- Content -->
    <div v-else class="card p-1">

      <div class="row g-1">

        <!-- ID -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">ID Crédit</label>
          <div>{{ credit.id }}</div>
        </div>

        <!-- Membre -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">Nom du membre</label>
          <div>{{ credit.membre?.nom ?? "Non renseigné" }}</div>
        </div>

        <!-- Montant accordé -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">Montant accordé</label>
          <div>{{ credit.montant_accorde }} FBU</div>
        </div>

        <!-- Taux d'intérêt -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">Taux d'intérêt</label>
          <div>{{ credit.taux_interet }} %</div>
        </div>

        <!-- Durée -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">Durée</label>
          <div>{{ credit.duree_mois }} mois</div>
        </div>

        <!-- Statut -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">Statut</label>
          <div>
            <span class="badge rounded-1" :class="getClassByStatut(credit.statut)">
              {{ getStatusLabel(credit.statut) }}
            </span>
          </div>
        </div>

        {{ credit }}

        <!-- Date -->
        <div class="col-md-6">
          <label class="fw-bold text-muted">Créé le</label>
          <div>{{ formatDate(credit.created_at) }}</div>
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

const credit = ref({});
const loading = ref(true);

// Fetch detail
const fetchCredit = async () => {
  loading.value = true;
  try {
    const { id } = route.params;
    const response = await api.get(`/credits/${id}`);

    if (response.success) {
      credit.value = response.data;
    } else {
      console.error("Erreur API:", response.message);
    }
  } catch (err) {
    console.error("Erreur lors du chargement :", err);
  } finally {
    loading.value = false;
  }
};

// Delete
const handleDelete = async () => {
  if (!confirm("Voulez-vous vraiment supprimer ce crédit ?")) return;

  try {
    await api.delete(`/credits/${credit.value.id}`);
    router.push("/credits");
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
  }
};

// Helpers
const getClassByStatut = (statut) => {
  switch (statut) {
    case "rejete": return "bg-danger";
    case "en_attente": return "bg-warning";
    case "en_cours": return "bg-info";
    case "approuve": return "bg-success";
    default: return "bg-secondary";
  }
};

const getStatusLabel = (statut) => {
  switch (statut) {
    case "rejete": return "Rejeté";
    case "en_attente": return "En attente";
    case "en_cours": return "En cours";
    case "approuve": return "Approuvé";
    default: return "Terminé";
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR");

onMounted(fetchCredit);
</script>

<style scoped>
label {
  font-size: 0.9rem;
}
</style>
