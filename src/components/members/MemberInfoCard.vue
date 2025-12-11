<template>
  <div class="card border-0 shadow-sm mb-4 p-0">
    <div
      class="card-header bg-white d-flex justify-content-between align-items-center py-3"
    >
      <h5 class="mb-0">Informations du membre</h5>
      <router-link
        v-if="member.id"
        :to="`/members/${member.id}/edit/`"
        class="btn btn-outline-primary"
      >
        Modifier
      </router-link>
    </div>
    <div class="card-body p-4">
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <h6 class="text-muted mb-1">Matricule</h6>
            <p class="mb-0 fw-600">
              {{ member.matricule || "Non défini" }}
            </p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Nom complet</h6>
            <p class="mb-0 fw-600">
              {{ member.nom || "Non défini" }}
            </p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Prénom</h6>
            <p class="mb-0 fw-600">
              {{ member.prenom || "Non défini" }}
            </p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Cotisation par Mois</h6>
            <p class="mb-0 fw-600">
              {{ formatCotisation(member) || "Non défini" }}
            </p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <h6 class="text-muted mb-1">Téléphone</h6>
            <p class="mb-0 fw-600">
              {{ member.telephone || "Non défini" }}
            </p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Email</h6>
            <p class="mb-0 fw-600">{{ member.email || "Non défini" }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Date d'adhésion</h6>
            <p class="mb-0 fw-600">
              {{ formatDate(member.date_adhesion) || "Non définie" }}
            </p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Statut</h6>
            <!-- <span :class="getStatusClass(member.statut)"> -->
            <span>
              {{ member.statut || "Inconnu" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  member: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      matricule: "",
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      categorie_cotisation: "",
      montant_cotisation: 0,
      categorie_devise: "",
      date_adhesion: "",
      statut: "Actif",
    }),
  },
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
};

const formatCategorieNom = (categorieNom) => {
  if (!categorieNom) return "";

  switch (categorieNom) {
    case "cadre_contractuel":
      return "Cadre Contractuel";
    case "collaborateur_a2":
      return "Collaborateur A2";
    case "chauffeur_planton":
      return "Chauffeur / Planton";
    case "service_externe_10":
      return "Service Externe (Cadres)";
    case "service_externe_5":
      return "Service Externe (Secrétaires d’ambassade)";
    default:
      return categorieNom; // fallback if not in the list
  }
};

const formatCategorieMontant = (montant) => {
  if (!montant && montant !== 0) return "0";
  return Number(montant).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatCotisation = (member) => {
  const name = formatCategorieNom(member.categorie_cotisation);
  const amount = formatCategorieMontant(member.montant_cotisation);
  const currency = member.categorie_devise || "Inconnu";
  return `${name} ${amount} ${currency}`;
};

const getStatusClass = (status) => {
  if (!status) return "bg-secondary";
  const statusMap = {
    actif: "bg-success",
    suspendu: "bg-warning",
    inactif: "bg-secondary",
  };
  return statusMap[status.toLowerCase()] || "bg-secondary";
};
</script>

<style scoped>
.text-muted {
  padding-top: 5px;
  color: rgb(0, 79, 118) !important;
  font-weight: 400;
}
</style>
