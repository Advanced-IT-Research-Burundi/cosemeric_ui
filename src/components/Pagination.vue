<template>
  <div class="pagination-wrapper" v-if="paginationData.total > 0">
    <!-- Informations sur les résultats -->
    <div class="pagination-info">
      <p>
        Affichage de {{ paginationData.from }} à {{ paginationData.to }} 
        sur {{ paginationData.total }} résultats
      </p>
    </div>

    <!-- Navigation de pagination -->
    <nav class="pagination-nav" aria-label="Navigation de pagination">
      <ul class="pagination-list">
        <!-- Bouton Précédent -->
        <li class="pagination-item">
          <button
            class="pagination-link"
            :class="{ disabled: !paginationData.prev_page_url }"
            :disabled="!paginationData.prev_page_url"
            @click="goToPage(paginationData.current_page - 1)"
          >
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Précédent</span>
          </button>
        </li>

        <!-- Liens de pages -->
        <li
          v-for="link in pageLinks"
          :key="link.label"
          class="pagination-item"
        >
          <button
            v-if="!isNaN(link.label)"
            class="pagination-link"
            :class="{ active: link.active }"
            @click="goToPage(parseInt(link.label))"
          >
            {{ link.label }}
          </button>
          <span v-else class="pagination-ellipsis">{{ link.label }}</span>
        </li>

        <!-- Bouton Suivant -->
        <li class="pagination-item">
          <button
            class="pagination-link"
            :class="{ disabled: !paginationData.next_page_url }"
            :disabled="!paginationData.next_page_url"
            @click="goToPage(paginationData.current_page + 1)"
          >
            <span class="sr-only">Suivant</span>
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Sélecteur de nombre d'éléments par page -->
    <div class="per-page-selector">
      <label for="perPage">Éléments par page :</label>
      <select
        id="perPage"
        v-model="selectedPerPage"
        @change="changePerPage"
        class="per-page-select"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
  paginationData: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['page-changed', 'per-page-changed']);

const selectedPerPage = ref(props.paginationData.per_page || 10);

// Computed pour générer les liens de pagination intelligents
const pageLinks = computed(() => {
  if (!props.paginationData.links) return [];
  
  // Filtrer les liens "Previous" et "Next"
  const links = props.paginationData.links.filter(
    link => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;'
  );
  
  const currentPage = props.paginationData.current_page;
  const lastPage = props.paginationData.last_page;
  
  // Si moins de 7 pages, afficher toutes les pages
  if (lastPage <= 7) {
    return links;
  }
  
  // Logique pour pagination intelligente
  let visiblePages = [];
  
  // Toujours afficher la première page
  if (currentPage > 3) {
    visiblePages.push({ label: '1', url: props.paginationData.path + '?page=1', active: false });
    if (currentPage > 4) {
      visiblePages.push({ label: '...', url: null, active: false });
    }
  }
  
  // Pages autour de la page courante
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(lastPage, currentPage + 1);
  
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push({
      label: i.toString(),
      url: props.paginationData.path + `?page=${i}`,
      active: i === currentPage
    });
  }
  
  // Toujours afficher la dernière page
  if (currentPage < lastPage - 2) {
    if (currentPage < lastPage - 3) {
      visiblePages.push({ label: '...', url: null, active: false });
    }
    visiblePages.push({
      label: lastPage.toString(),
      url: props.paginationData.path + `?page=${lastPage}`,
      active: false
    });
  }
  
  return visiblePages;
});

const goToPage = (page) => {
  if (page < 1 || page > props.paginationData.last_page) return;
  emit('page-changed', page);
};

const changePerPage = () => {
  emit('per-page-changed', selectedPerPage.value);
};
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.875rem;
}

.pagination-nav {
  display: flex;
  justify-content: center;
}

.pagination-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 5px;
}

.pagination-item {
  margin: 0;
}

.pagination-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  min-width: 40px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #495057;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.pagination-link:hover:not(.disabled):not(.active) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.pagination-link.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  cursor: default;
}

.pagination-link.disabled {
  color: #6c757d;
  background-color: white;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  color: #6c757d;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
}

.per-page-selector label {
  color: #495057;
  font-weight: 500;
}

.per-page-select {
  padding: 5px 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #495057;
  cursor: pointer;
}

.per-page-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .pagination-wrapper {
    padding: 15px 10px;
  }
  
  .pagination-list {
    flex-wrap: wrap;
    gap: 3px;
  }
  
  .pagination-link {
    padding: 6px 10px;
    min-width: 35px;
    font-size: 0.8rem;
  }
  
  .per-page-selector {
    flex-direction: column;
    text-align: center;
    gap: 5px;
  }
}
</style>