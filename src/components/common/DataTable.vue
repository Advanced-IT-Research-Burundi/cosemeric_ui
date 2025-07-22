<template>
  <div class="data-table">
    <!-- Search -->
    <div v-if="showSearch" class="mb-3">
      <div class="input-group">
        <input
          v-model="localSearchQuery"
          type="text"
          class="form-control"
          placeholder="Rechercher..."
          @keyup.enter="handleSearch"
        >
        <button v-if="localSearchQuery" @click="clearSearch" class="btn btn-outline-secondary">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key"
              @click="col.sortable ? sort(col.key) : null"
              :class="{ 'cursor-pointer': col.sortable }"
            >
              {{ col.label }}
              <i 
                v-if="col.sortable" 
                class="fas ms-1"
                :class="{
                  'fa-sort': sortBy !== col.key,
                  'fa-sort-up': sortBy === col.key && sortDirection === 'asc',
                  'fa-sort-down': sortBy === col.key && sortDirection === 'desc'
                }"
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="!data?.data?.length">
            <td :colspan="columns.length" class="text-center py-4">
              <div class="text-muted">
                <i class="fas fa-inbox fa-2x mb-2"></i>
                <p class="mb-0">Aucune donnée disponible</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="(item, index) in data.data" :key="item.id || index">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :item="item" :value="getNestedValue(item, col.key)">
                {{ formatCell(item, col) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && data?.data?.length" class="mt-3 d-flex justify-content-between align-items-center">
      <div class="text-muted">
        Affichage de {{ data.from || 0 }} à {{ data.to || 0 }} sur {{ data.total || 0 }}
      </div>
      <nav>
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ 'disabled': data.current_page === 1 }">
            <a class="page-link" @click="changePage(data.current_page - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li 
            v-for="page in visiblePages" 
            :key="page" 
            class="page-item"
            :class="{ 'active': page === data.current_page }"
          >
            <a class="page-link" @click="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ 'disabled': data.current_page === data.last_page }">
            <a class="page-link" @click="changePage(data.current_page + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'DataTable',
  
  props: {
    columns: { type: Array, required: true },
    data: { 
      type: Object, 
      default: () => ({
        data: [],
        current_page: 1,
        from: 0,
        to: 0,
        total: 0,
        last_page: 1,
        per_page: 15
      })
    },
    loading: { type: Boolean, default: false },
    showSearch: { type: Boolean, default: true },
    showPagination: { type: Boolean, default: true },
    sortBy: { type: String, default: '' },
    sortDirection: { type: String, default: 'asc' },
    searchQuery: { type: String, default: '' }
  },

  emits: ['update:sortBy', 'update:sortDirection', 'update:searchQuery', 'page-changed', 'sort-changed', 'search'],

  setup(props, { emit }) {
    const localSearchQuery = ref(props.searchQuery);
    
    const visiblePages = computed(() => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, props.data.current_page - Math.floor(maxVisible / 2));
      let end = Math.min(start + maxVisible - 1, props.data.last_page);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    });

    function getNestedValue(obj, path) {
      return path.split('.').reduce((o, p) => (o || {})[p], obj);
    }

    function formatCell(item, column) {
      const value = getNestedValue(item, column.key);
      if (column.format) {
        return column.format(value, item);
      }
      return value ?? '-';
    }

    function changePage(page) {
      if (page >= 1 && page <= props.data.last_page && page !== props.data.current_page) {
        emit('page-changed', page);
      }
    }

    function sort(key) {
      let direction = 'asc';
      if (props.sortBy === key) {
        direction = props.sortDirection === 'asc' ? 'desc' : 'asc';
      }
      emit('update:sortBy', key);
      emit('update:sortDirection', direction);
      emit('sort-changed', { sortBy: key, sortDirection: direction });
    }

    function handleSearch() {
      emit('update:searchQuery', localSearchQuery.value);
      emit('search', localSearchQuery.value);
    }

    function clearSearch() {
      localSearchQuery.value = '';
      handleSearch();
    }

    watch(() => props.searchQuery, (newVal) => {
      localSearchQuery.value = newVal;
    });

    return {
      localSearchQuery,
      visiblePages,
      getNestedValue,
      formatCell,
      changePage,
      sort,
      handleSearch,
      clearSearch
    };
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
