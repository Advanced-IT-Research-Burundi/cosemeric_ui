<template>
  <div class="cotisations-container">
    <h1 class="page-title">Liste des Cotisations</h1>
    
    <!-- Tableau des cotisations -->
    <div class="table-container">
      <table class="cotisations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Membre ID</th>
            <th>Période ID</th>
            <th>Montant</th>
            <th>Devise</th>
            <th>Date de Paiement</th>
            <th>Statut</th>
            <th>Mode de Paiement</th>
            <th>Référence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cotisation in cotisationListes.data" :key="cotisation.id">
            <td>{{ cotisation.id }}</td>
            <td>{{ cotisation.membre_id }}</td>
            <td>{{ cotisation.periode_id }}</td>
            <td class="montant">{{ formatMontant(cotisation.montant) }}</td>
            <td>{{ cotisation.devise }}</td>
            <td>{{ formatDate(cotisation.date_paiement) }}</td>
            <td>
              <span :class="getStatutClass(cotisation.statut)">
                {{ cotisation.statut }}
              </span>
            </td>
            <td>{{ getModePaiement(cotisation.mode_paiement) }}</td>
            <td>{{ cotisation.reference_paiement }}</td>
            <td class="actions">
              <button class="btn btn-view" @click="viewCotisation(cotisation)">Voir</button>
              <button class="btn btn-edit" @click="editCotisation(cotisation)">Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Composant de pagination -->
    <Pagination 
      v-if="cotisationListes.data && cotisationListes.data.length > 0"
      :pagination-data="cotisationListes"
      @page-changed="changePage"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import api from "../../services/api";
import { useStore } from "vuex";
import Pagination from "../../components/Pagination.vue";

const store = useStore();

onMounted(() => {
  console.log('Component mounted');
  getData();
});

const getData = async (page = 1) => {
  try {
    const response = await api.get(`/cotisations?page=${page}`);
    store.state.cotisations = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const cotisationListes = computed(() => store.state.cotisations || { data: [] });

// Méthodes utilitaires
const formatMontant = (montant) => {
  return parseFloat(montant).toLocaleString('fr-FR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const getStatutClass = (statut) => {
  return {
    'statut-paye': statut === 'paye',
    'statut-impaye': statut === 'impaye',
    'statut-pending': statut === 'pending'
  };
};

const getModePaiement = (mode) => {
  const modes = {
    '1': 'Espèces',
    '2': 'Carte bancaire',
    '3': 'Virement',
    '4': 'Chèque'
  };
  return modes[mode] || 'Inconnu';
};

// Actions
const viewCotisation = (cotisation) => {
  console.log('Voir cotisation:', cotisation);
  // Logique pour voir les détails
};

const editCotisation = (cotisation) => {
  console.log('Modifier cotisation:', cotisation);
  // Logique pour modifier
};

const changePage = (page) => {
  getData(page);
};
</script>

<style scoped>
.cotisations-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  text-align: center;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.cotisations-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 800px;
}

.cotisations-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  padding: 15px 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.cotisations-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.cotisations-table tbody tr:hover {
  background-color: #f8f9fa;
}

.montant {
  font-weight: 600;
  color: #28a745;
}

.statut-paye {
  background-color: #d4edda;
  color: #155724;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.statut-impaye {
  background-color: #f8d7da;
  color: #721c24;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.statut-pending {
  background-color: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.actions {
  white-space: nowrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-right: 5px;
  transition: background-color 0.3s ease;
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}

.btn-view:hover {
  background-color: #138496;
}

.btn-edit {
  background-color: #ffc107;
  color: #212529;
}

.btn-edit:hover {
  background-color: #e0a800;
}

@media (max-width: 768px) {
  .cotisations-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>