<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Détails du membre</h2>
      <router-link to="/members" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour à la liste
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
    </div>

    <div v-else>
      <MemberFinancialSummary :cards="financialCards" />
      <MemberInfoCard :member="member" />
      <div class="row">
        <div class="col-md-6 mb-4">
          <ActivityList
            title="Dernières cotisations"
            :items="contributions"
            empty-message="Aucune cotisation récente"
          />
        </div>
        <div class="col-md-6 mb-4">
          <ActivityList
            title="Dernières assistances"
            :items="assistances"
            empty-message="Aucune assistance récente"
            status-field="status"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import MemberFinancialSummary from "../../components/members/MemberFinancialSummary.vue";
import MemberInfoCard from "../../components/members/MemberInfoCard.vue";
import ActivityList from "../../components/members/ActivityList.vue";

const route = useRoute();
const memberId = route.params.id;
const loading = ref(true);
const error = ref(null);
const member = ref({
  id: memberId,
  memberNumber: "",
  fullName: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  category: "",
  joinDate: "",
  status: "",
});

const financialCards = ref([]);

const buildFinancialCards = (data) => {
  financialCards.value = [
    {
      title: "Total cotisations",
      value: `${(data.cotisations_paid || 0).toLocaleString()} ${
        data.devise || "FBU"
      }`,
      icon: "fas fa-coins",
      color: "text-success",
    },
    {
      title: "État de remboursement des crédits ",
      value: `${data.cotisations_manquantes ?? 0} mois`, // Handle missing value with ?? for default value
      icon: "fas fa-exclamation-triangle",
      color: "text-warning",
    },
    {
      title: "Montants reçus en assistance ",
      value: `${(data.credit_encours || 0).toLocaleString()} ${
        data.devise || "FBU"
      }`, // Use devise if available
      subtext: data.credit_restant
        ? `Reste: ${data.credit_restant.toLocaleString()} ${
            data.devise || "FBU"
          }` // Include remaining credit if available
        : "",
      icon: "fas fa-hand-holding-usd",
      color: "text-info",
    },
    {
      title: "Anomalies ou retards éventuels ",
      value: `${data.assistances_recues ?? 0} `, // Default to 0 if value is missing
      icon: "fas fa-hands-helping",
      color: "text-primary",
    },
  ];
};

const contributions = ref([]);
const assistances = ref([]);
const credits = ref([]);

const fetchMemberDetails = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/membres/${memberId}`);
    const memberData = response.data;

    member.value = {
      id: memberData.id,
      user_id: memberData.user_id, // Assuming this is available in `memberData`
      nom: memberData.nom,
      prenom: memberData.prenom,
      matricule: memberData.matricule,
      email: memberData.email,
      telephone: memberData.telephone,
      categorie_id: memberData.categorie_id,
      statut: memberData.statut
        ? memberData.statut.charAt(0).toUpperCase() + memberData.statut.slice(1)
        : "Inconnu",
      date_adhesion: memberData.date_adhesion,
      categorie_nom: memberData.categorie_nom, // Assuming you have this in `memberData`
      categorie_cotisation: memberData.categorie_cotisation, // Assuming you have this in `memberData`
      categorie_devise: memberData.categorie_devise, // Assuming you have this in `memberData`
      cotisations_paid: memberData.cotisations_paid, // Assuming this is available
      cotisations: memberData.cotisations || [], // Assuming `cotisations` is an array
      credits: memberData.credits || [], // Assuming `credits` is an array
      remboursements_pending: memberData.remboursements_pending || 0, // Assuming this is available
      assistances: memberData.assistances || [], // Assuming this is available
    };

    contributions.value = memberData.cotisations || [];

    assistances.value = memberData.assistances || [];

    // Mettre à jour les cartes avec les vraies données
    buildFinancialCards(memberData);
  } catch (err) {
    console.error("Error fetching member details:", err);
    error.value =
      "Impossible de charger les détails du membre. Veuillez réessayer.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMemberDetails();
});
</script>
