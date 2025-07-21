<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Tous les membres</h2>
      <button class="btn btn-primary" @click="addMember">
        <i class="fas fa-plus me-2"></i>Ajouter un membre
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger mb-4" role="alert">
      <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
    </div>

    <!-- Members Table -->
    <DataTable
      :columns="columns"
      :data="membersData"
      :loading="loading"
      :sort-by.sync="sortBy"
      :sort-direction.sync="sortDirection"
      :search-query.sync="searchQuery"
      @page-changed="handlePageChange"
      @sort-changed="handleSortChange"
      @search="handleSearch"
      @row-click="handleRowClick"
      class="card"
    >
      <!-- Custom filter slot -->
      <template #filters>
        <div class="col-md-3">
          <select v-model="statusFilter" class="form-select" @change="applyFilters">
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>
      </template>

      <!-- Custom cell templates -->
      <template #cell-nom="{ item, value }">
        <div class="d-flex align-items-center">
          <div class="avatar me-3">
            <div class="avatar-text bg-light text-dark">
              {{ getInitials(`${item.prenom} ${item.nom}`) }}
            </div>
          </div>
          <div class="tr-width">
            <h6 class="mb-0 text-truncate-1">{{ item.prenom }} {{ item.nom }}</h6>
            <small class="text-muted">ID: {{ item.id }}</small>
          </div>
        </div>
      </template>

      <template #cell-email="{ value, item }">
        <div>{{ value }}</div>
        <small class="text-muted">{{ item.telephone || 'Aucun téléphone' }}</small>
      </template>

      <template #cell-statut="{ value }">
        <span class="badge" :class="getStatusClass(value)">
          {{ formatStatus(value) }}
        </span>
      </template>

      <

      <template #cell-actions="{ item }">
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-primary"
            @click.stop="viewMember(item.id)"
            title="Voir les détails"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click.stop="editMember(item.id)"
            title="Modifier"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-danger"
            @click.stop="confirmDelete(item)"
            title="Supprimer"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ 'show d-block': showDeleteModal }" tabindex="-1" v-if="showDeleteModal">
      <div class="modal-dialog modal-dialog-centered" style="z-index: 1060;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteMember" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" @click="showDeleteModal = false"></div>
    </div>
  </div>
      
</template>

<script>
import api from '../../services/api';
import DataTable from '../../components/common/DataTable.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

export default {
  name: 'AllMembers',
  components: {
    DataTable
  },
  data() {
    return {
      members: [],
      loading: false,
      error: null,
      searchQuery: '',
      statusFilter: '',
      sortBy: 'nom',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 15,
      searchTimeout: null,
      membersData: {
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0
      },
      columns: [
        { 
          key: 'nom', 
          label: 'Membre',
          sortable: true,
          class: 'max-w-25'
        },
        { 
          key: 'email', 
          label: 'Contact',
          sortable: true
        },
        { 
          key: 'statut', 
          label: 'Statut',
          sortable: true
        },
        { 
          key: 'date_adhesion', 
          label: "Date d'adhésion",
          sortable: true,
          formatter: (value) => this.formatDate(value)
        },
        { 
          key: 'actions', 
          label: 'Actions', 
          sortable: false,
          class: 'text-end'
        }
      ],
      memberToDelete: null,
      showDeleteModal: false,
    };
  },
  methods: {
    async fetchMembers() {
      this.loading = true;
      this.error = null;
      
      try {
        // Build query parameters for Laravel pagination
        const queryParams = new URLSearchParams();
        queryParams.append('page', this.currentPage);
        
        // Add optional parameters if they exist
        if (this.itemsPerPage) queryParams.append('per_page', this.itemsPerPage);
        if (this.searchQuery) queryParams.append('query', this.searchQuery);
        if (this.statusFilter) queryParams.append('status', this.statusFilter);
        if (this.sortBy) queryParams.append('sort_by', this.sortBy);
        if (this.sortDirection) queryParams.append('sort_direction', this.sortDirection);
        
        // Construct the URL with query parameters
        const url = `/membres?${queryParams.toString()}`;
        console.log(url);
        
        
        // Make the API request - note we're not using the params option here
        // because we've already built the query string
        const response = await api.get(url);
        
        // Handle Laravel pagination response format
        if (response.data) {
          this.members = response.data.data || [];
          this.membersData = {
            data: response.data.data || [],
            total: response.data.total || 0,
            per_page: parseInt(response.data.per_page) || this.itemsPerPage,
            current_page: parseInt(response.data.current_page) || 1,
            last_page: response.data.last_page || 1,
            from: response.data.from || 0,
            to: response.data.to || 0
          };
          
          // Update current page if it changed from the response
          this.currentPage = parseInt(response.data.current_page) || 1;
        } else {
          throw new Error('Format de réponse inattendu de l\'API');
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        this.error = error.response?.data?.message || 'Erreur lors du chargement des membres';
      } finally {
        this.loading = false;
      }
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchMembers();
    },
    
    handleSortChange({ sortBy, sortDirection }) {
      this.sortBy = sortBy;
      this.sortDirection = sortDirection;
      this.fetchMembers();
    },
    
    handleSearch(query) {
      this.searchQuery = query || '';
      this.currentPage = 1;
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.fetchMembers();
      }, 300); // 300ms debounce
    },
    
    handleRowClick(item) {
      this.viewMember(item.id);
    },
    
    applyFilters() {
      this.currentPage = 1;
      this.fetchMembers();
    },
    
    clearSearch() {
      this.searchQuery = '';
      this.applyFilters();
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.sortBy = 'nom';
      this.sortDirection = 'asc';
      this.currentPage = 1;
      this.fetchMembers();
    },
    
    viewMember(id) {
      this.$router.push(`/members/${id}`);
    },
    
    editMember(id) {
      this.$router.push(`/members/${id}/edit`);
    },
    
    addMember() {
      this.$router.push('/members/create');
    },
    
    confirmDelete(member) {
      this.memberToDelete = member;
      this.showDeleteModal = true;
    },
    
    async deleteMember() {
      if (!this.memberToDelete) return;
      
      try {
        await api.delete(`/membres/${this.memberToDelete.id}`);
        
        // Remove from local array
        this.members = this.members.filter(m => m.id !== this.memberToDelete.id);
        this.membersData.data = this.members;
        this.membersData.total--;
        
        // Show success message
        toast.success('Membre supprimé avec succès');
        
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Une erreur est survenue lors de la suppression du membre');
      } finally {
        this.showDeleteModal = false;
        this.memberToDelete = null;
      }
    },
    
    getInitials(name) {
      if (!name) return '??';
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('fr-FR');
    },
    
    formatStatus(status) {
      const statusMap = {
        actif: 'Actif',
        inactif: 'Inactif',
        suspendu: 'Suspendu',
        banni: 'Banni',
        en_attente: 'En attente',
      };
      return statusMap[status] || status;
    },
    
    getStatusClass(status) {
      const statusClasses = {
        actif: 'bg-success',
        inactif: 'bg-secondary',
        suspendu: 'bg-warning',
        banni: 'bg-danger',
        en_attente: 'bg-info',
      };
      return statusClasses[status] || 'bg-secondary';
    },
    itemsPerPage: {
      handler() {
        this.currentPage = 1;
        this.fetchMembers();
      }
    }
  },
  created() {
    this.fetchMembers();
  },
  
  mounted() {
    // Initialize DataTable with any saved state from localStorage if needed
    const savedState = localStorage.getItem('membersTableState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.sortBy = state.sortBy || 'nom';
        this.sortDirection = state.sortDirection || 'asc';
        this.itemsPerPage = state.itemsPerPage || 15;
      } catch (e) {
        console.error('Error loading table state:', e);
      }
    }
  },
  
  beforeUnmount() {
    // Clear any pending search timeouts
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Save table state to localStorage
    const state = {
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      itemsPerPage: this.itemsPerPage
    };
    localStorage.setItem('membersTableState', JSON.stringify(state));
  }
}
</script>

<style scoped>
.avatar {
  width: 40px;
  max-width: 40px !important;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  background-color: #f0f2f5;
  color: #495057;
}

.avatar-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.cursor-pointer {
  cursor: pointer;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.badge {
  padding: 0.35em 0.65em;
  font-weight: 500;
  font-size: 0.75em;
  letter-spacing: 0.5px;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  min-width: 38px;
  text-align: center;
}

.form-select-sm {
  padding: 0.25rem 1.75rem 0.25rem 0.5rem;
  font-size: 0.8125rem;
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .table-responsive {
    border: 0;
  }
  
  .table thead {
    display: none;
  }
  
  .table, .table tbody, .table tr, .table td {
    display: block;
    width: 100%;
  }
  
  .table tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }
  
  .table td {
    text-align: right;
    padding-left: 50%;
    position: relative;
    border-bottom: 1px solid #dee2e6;
  }
  
  .table td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    width: 50%;
    padding-right: 1rem;
    text-align: left;
    font-weight: 600;
    color: #6c757d;
  }
  
  /* Hide actions label on mobile */
  .table td:last-child::before {
    display: none;
  }
  
  .table td:last-child {
    text-align: center;
    padding-left: 0.75rem;
  }
  
  .btn-group {
    width: 100%;
    justify-content: center;
  }
}

/* Animation for menu items */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.tr-width {
  max-width: 50px !important;
}

.text-truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}
</style>
