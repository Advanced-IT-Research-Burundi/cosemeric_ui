<template>
  <div class="card border-0 shadow-sm mb-4 p-0">
    <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
      <h5 class="mb-0">Informations du membre</h5>
      <router-link v-if="member.id" :to="`/members/${member.id}/edit/`" class="btn btn-outline-primary">
        Modifier
      </router-link>
    </div>
    <div class="card-body p-4">
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <h6 class="text-muted mb-1">Matricule</h6>
            <p class="mb-0 fw-semibold">{{ member.memberNumber || 'Non défini' }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Nom complet</h6>
            <p class="mb-0 fw-semibold">{{ member.fullName || 'Non défini' }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Prénom</h6>
            <p class="mb-0 fw-semibold">{{ member.firstName || 'Non défini' }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Nom</h6>
            <p class="mb-0 fw-semibold">{{ member.lastName || 'Non défini' }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <h6 class="text-muted mb-1">Téléphone</h6>
            <p class="mb-0 fw-semibold">{{ member.phone || 'Non défini' }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Email</h6>
            <p class="mb-0 fw-semibold">{{ member.email || 'Non défini' }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Date d'adhésion</h6>
            <p class="mb-0 fw-semibold">{{ formatDate(member.joinDate) || 'Non définie' }}</p>
          </div>
          <div class="mb-3">
            <h6 class="text-muted mb-1">Statut</h6>
            <span class="badge rounded-1" :class="getStatusClass(member.status)">
              {{ member.status || 'Inconnu' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  member: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      memberNumber: '',
      fullName: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      category: '',
      joinDate: '',
      status: 'Actif'
    })
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getStatusClass = (status) => {
  if (!status) return 'bg-secondary';
  const statusMap = {
    'actif': 'bg-success',
    'suspendu': 'bg-warning',
    'inactif': 'bg-secondary'
  };
  return statusMap[status.toLowerCase()] || 'bg-secondary';
};
</script>
