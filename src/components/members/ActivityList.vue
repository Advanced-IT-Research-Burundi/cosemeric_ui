<template>
  <div class="card h-100 border-0 shadow-sm p-0">
    <div class="card-header bg-white py-3">
      <h5 class="mb-0 fw-semibold">{{ title }}</h5>
    </div>
    <div class="card-body p-4">
      <div v-if="items.length > 0" class="list-group list-group-flush">
        <div v-for="(item, index) in items" :key="index" class="list-group-item px-0 border-0">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1 fw-semibold">{{ item.title || item.type || `${item.month} ${item.year}` }}</h6>
              <small class="text-muted">
                {{ item.date ? `Le ${formatDate(item.date)}` : '' }}
                {{ item.paymentDate ? `Payé le ${formatDate(item.paymentDate)}` : '' }}
              </small>
            </div>
            <div class="text-end">
              <div v-if="item.amount" class="fw-semibold">{{ item.amount }}</div>
              <span v-if="statusField && item[statusField]" 
                    class="badge" 
                    :class="getStatusClass(item[statusField])">
                {{ item[statusField] }}
              </span>
              <span v-else-if="item.paymentDate" class="badge bg-success">Payé</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4 text-muted">
        {{ emptyMessage }}
      </div>
    </div>
    <div class="card-footer border-top-0 bg-white d-none">
        <div v-if="showViewAll" class="text-end mt-2">
            <button class="btn btn-sm btn-light text-decoration-none">
            Voir tout <i class="fas fa-arrow-right ms-1"></i>
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  emptyMessage: {
    type: String,
    default: 'Aucun élément récent'
  },
  statusField: {
    type: String,
    default: ''
  },
  showViewAll: {
    type: Boolean,
    default: true
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getStatusClass = (status) => {
  const statusMap = {
    'Approuvée': 'bg-success',
    'En attente': 'bg-warning',
    'Refusée': 'bg-danger'
  };
  return statusMap[status] || 'bg-secondary';
};
</script>
