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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import MemberFinancialSummary from '../../components/members/MemberFinancialSummary.vue';
import MemberInfoCard from '../../components/members/MemberInfoCard.vue';
import ActivityList from '../../components/members/ActivityList.vue';

const route = useRoute();
const memberId = route.params.id;
const loading = ref(true);
const error = ref(null);
const member = ref({
  id: memberId,
  memberNumber: '',
  fullName: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  category: '',
  joinDate: '',
  status: ''
});

const financialCards = ref([]);

const buildFinancialCards = (data) => {
  financialCards.value = [
    {
      title: 'Total cotisations',
      value: `${(data.cotisations_total || 0).toLocaleString()} FBU`,
      icon: 'fas fa-coins',
      color: 'text-success'
    },
    {
      title: 'Cotisations manquantes',
      value: `${data.cotisations_manquantes ?? 0} mois`,
      icon: 'fas fa-exclamation-triangle',
      color: 'text-warning'
    },
    {
      title: 'Crédit en cours',
      value: `${(data.credit_encours || 0).toLocaleString()} FBU`,
      subtext: data.credit_restant
        ? `Reste: ${(data.credit_restant).toLocaleString()} FBU`
        : '',
      icon: 'fas fa-hand-holding-usd',
      color: 'text-info'
    },
    {
      title: 'Assistances',
      value: `${data.assistances_recues ?? 0} reçues`,
      icon: 'fas fa-hands-helping',
      color: 'text-primary'
    }
  ];
};


const contributions = ref([]);
const assistances = ref([]);

const fetchMemberDetails = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/membres/${memberId}`);
    const memberData = response.data;

    member.value = {
      id: memberData.id,
      memberNumber: memberData.matricule,
      fullName: memberData.full_name,
      firstName: memberData.prenom,
      lastName: memberData.nom,
      phone: memberData.telephone,
      email: memberData.email,
      category: memberData.categorie_id,
      joinDate: memberData.date_adhesion,
      status: memberData.statut
        ? memberData.statut.charAt(0).toUpperCase() + memberData.statut.slice(1)
        : 'Inconnu'
    };

    // Mettre à jour les cartes avec les vraies données
    buildFinancialCards(memberData);

  } catch (err) {
    console.error('Error fetching member details:', err);
    error.value = 'Impossible de charger les détails du membre. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMemberDetails();
});
</script>