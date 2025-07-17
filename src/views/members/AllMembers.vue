<template>
    <div class="container py-4 px-4">
        <div class="d-flex justify-content-between align-items-center">
            <h1>Membres</h1>
            <button class="btn btn-primary" @click="addMember">
                <i class="fas fa-plus me-2"></i>Ajouter un membre
            </button>
        </div>
        <!-- Search and Filter Bar -->
        <div class="card mb-4">
        <div class="card-body">
            <div class="row g-3">
            <div class="col-md-6">
                <div class="input-group">
                <span class="input-group-text">
                    <i class="fas fa-search"></i>
                </span>
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    class="form-control" 
                    placeholder="Rechercher des membres..."
                    @keyup.enter="applyFilters"
                >
                <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="clearSearch"
                >
                    <i class="fas fa-times"></i>
                </button>
                </div>
            </div>
            <div class="col-md-3">
                <select v-model="statusFilter" class="form-select" @change="applyFilters">
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
                </select>
            </div>
            <div class="col-md-3">
                <select v-model="sortBy" class="form-select" @change="applyFilters">
                <option value="name_asc">Trier par nom (A-Z)</option>
                <option value="name_desc">Trier par nom (Z-A)</option>
                <option value="date_asc">Plus ancien d'abord</option>
                <option value="date_desc">Plus récent d'abord</option>
                </select>
            </div>
            </div>
        </div>
        </div>

        <!-- Members Table -->
        <div class="card">
        <div class="card-body p-0">
            <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                <tr>
                    <th>Membre</th>
                    <th>ID</th>
                    <th>Contact</th>
                    <th>Statut</th>
                    <th>Date d'adhésion</th>
                    <th class="text-end">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-if="loading">
                    <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    </td>
                </tr>
                <tr v-else-if="filteredMembers.length === 0">
                    <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-users-slash fa-2x mb-2"></i>
                        <p class="mb-0">Aucun membre trouvé</p>
                        <button class="btn btn-link p-0" @click="resetFilters">
                        Réinitialiser les filtres
                        </button>
                    </div>
                    </td>
                </tr>
                <tr v-for="member in paginatedMembers" :key="member.id" class="cursor-pointer" @click="viewMember(member.id)">
                    <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-3">
                        <img 
                            v-if="member.avatar" 
                            :src="member.avatar" 
                            :alt="member.name"
                            class="rounded-circle"
                        >
                        <div v-else class="avatar-text">
                            {{ getInitials(member.name) }}
                        </div>
                        </div>
                        <div>
                        <h6 class="mb-0">{{ member.name }}</h6>
                        <small class="text-muted">{{ member.memberId }}</small>
                        </div>
                    </div>
                    </td>
                    <td>{{ member.memberNumber }}</td>
                    <td>
                    <div>{{ member.email }}</div>
                    <small class="text-muted">{{ member.phone || 'Aucun téléphone' }}</small>
                    </td>
                    <td>
                    <span class="badge" :class="getStatusClass(member.status)">
                        {{ formatStatus(member.status) }}
                    </span>
                    </td>
                    <td>{{ formatDate(member.joinDate) }}</td>
                    <td class="text-end">
                    <div class="btn-group" @click.stop>
                        <button 
                        class="btn btn-sm btn-outline-primary"
                        @click.stop="viewMember(member.id)"
                        title="Voir les détails"
                        >
                        <i class="fas fa-eye"></i>
                        </button>
                        <button 
                        class="btn btn-sm btn-outline-secondary"
                        @click.stop="editMember(member.id)"
                        title="Modifier"
                        >
                        <i class="fas fa-edit"></i>
                        </button>
                        <button 
                        class="btn btn-sm btn-outline-danger"
                        @click.stop="confirmDelete(member)"
                        title="Supprimer"
                        >
                        <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center p-3 border-top" v-if="filteredMembers.length > 0">
            <div class="text-muted">
                Affichage de <span class="fw-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> à 
                <span class="fw-semibold">{{ Math.min(currentPage * itemsPerPage, filteredMembers.length) }}</span> sur 
                <span class="fw-semibold">{{ filteredMembers.length }}</span> membres
            </div>
            
            <nav>
                <ul class="pagination mb-0">
                <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                    <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                    <i class="fas fa-chevron-left"></i>
                    </button>
                </li>
                
                <li 
                    v-for="page in visiblePages" 
                    :key="page" 
                    class="page-item"
                    :class="{ 'active': page === currentPage }"
                >
                    <button class="page-link" @click="currentPage = page">
                    {{ page }}
                    </button>
                </li>
                
                <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                    <button 
                    class="page-link" 
                    @click="currentPage++" 
                    :disabled="currentPage === totalPages"
                    >
                    <i class="fas fa-chevron-right"></i>
                    </button>
                </li>
                </ul>
            </nav>
            
            <div class="d-flex align-items-center">
                <label class="me-2 mb-0 text-muted">Lignes par page :</label>
                <select 
                v-model="itemsPerPage" 
                class="form-select form-select-sm" 
                style="width: auto;"
                @change="currentPage = 1"
                >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                </select>
            </div>
            </div>
        </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal fade" :class="{ 'show d-block': showDeleteModal }" tabindex="-1" v-if="showDeleteModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Confirmer la suppression</h5>
                <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
            </div>
            <div class="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer <strong>{{ memberToDelete?.name }}</strong> ? Cette action est irréversible.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" @click="showDeleteModal = false">
                Annuler
                </button>
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

export default {
  name: 'AllMembers',
  data() {
    return {
      loading: false,
      members: [],
      searchQuery: '',
      statusFilter: '',
      sortBy: 'name_asc',
      currentPage: 1,
      itemsPerPage: 10,
      showDeleteModal: false,
      memberToDelete: null,
      deleting: false
    };
  },
  computed: {
    filteredMembers() {
      let result = [...this.members];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(member => 
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.phone?.toLowerCase().includes(query) ||
          member.memberNumber?.toLowerCase().includes(query)
        );
      }
      
      // Apply status filter
      if (this.statusFilter) {
        result = result.filter(member => member.status === this.statusFilter);
      }
      
      // Apply sorting
      const [field, direction] = this.sortBy.split('_');
      result.sort((a, b) => {
        let comparison = 0;
        
        if (field === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (field === 'date') {
          comparison = new Date(a.joinDate) - new Date(b.joinDate);
        }
        
        return direction === 'asc' ? comparison : -comparison;
      });
      
      return result;
    },
    paginatedMembers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredMembers.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredMembers.length / this.itemsPerPage);
    },
    visiblePages() {
      const range = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
      
      return range;
    }
  },
  watch: {
    filteredMembers() {
      // Reset to first page when filters change
      this.currentPage = 1;
    }
  },
  created() {
    this.fetchMembers();
  },
  methods: {
    async fetchMembers() {
      this.loading = true;
      try {
        // TODO: Replace with actual API call
        // const response = await this.$http.get('/api/members');
        // this.members = response.data;
        
        // Mock data for demonstration
        this.members = Array.from({ length: 35 }, (_, i) => ({
          id: i + 1,
          name: `Member ${i + 1}`,
          email: `member${i + 1}@example.com`,
          phone: `+1 (555) ${String(i + 1000).padStart(4, '0')}`,
          memberNumber: `MEM-${String(i + 1).padStart(4, '0')}`,
          status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
          joinDate: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365 * 3)).toISOString(),
          avatar: i % 3 === 0 ? `https://i.pravatar.cc/150?img=${i % 70 + 1}` : null
        }));
      } catch (error) {
        console.error('Error fetching members:', error);
        // Show error toast/notification
        this.$toast.error('Failed to load members. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      // Triggered when search or filter changes
      this.currentPage = 1;
    },
    clearSearch() {
      this.searchQuery = '';
      this.applyFilters();
    },
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.sortBy = 'name_asc';
      this.currentPage = 1;
    },
    viewMember(id) {
      this.$router.push(`/members/${id}`);
    },
    editMember(id) {
      this.$router.push(`/members/edit/${id}`);
    },
    confirmDelete(member) {
      this.memberToDelete = member;
      this.showDeleteModal = true;
    },
    async deleteMember() {
      if (!this.memberToDelete) return;
      
      this.deleting = true;
      try {
        // TODO: Replace with actual API call
        // await this.$http.delete(`/api/members/${this.memberToDelete.id}`);
        
        // Remove from local state
        this.members = this.members.filter(m => m.id !== this.memberToDelete.id);
        
        // Show success message
        this.$toast.success('Member deleted successfully');
        
        // Close modal
        this.showDeleteModal = false;
        this.memberToDelete = null;
      } catch (error) {
        console.error('Error deleting member:', error);
        this.$toast.error('Failed to delete member. Please try again.');
      } finally {
        this.deleting = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    formatStatus(status) {
      if (!status) return 'Unknown';
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    getStatusClass(status) {
      const statusClasses = {
        active: 'bg-success bg-opacity-10 text-success',
        inactive: 'bg-secondary bg-opacity-10 text-secondary',
        pending: 'bg-warning bg-opacity-10 text-warning',
      };
      return statusClasses[status] || 'bg-light text-dark';
    },
    getInitials(name) {
      if (!name) return '??';
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
  }
};
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  color: #6c757d;
  font-weight: 600;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cursor-pointer {
  cursor: pointer;
}

.table > :not(caption) > * > * {
  padding: 1rem 1.25rem;
}

.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
}

.page-link {
  min-width: 2.5rem;
  text-align: center;
}

.modal-backdrop {
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 767.98px) {
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
    padding: 0.5rem 1rem;
    text-align: right;
    position: relative;
    padding-left: 40%;
  }
  
  .table td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    width: 40%;
    padding-right: 1rem;
    text-align: left;
    font-weight: 600;
    color: #6c757d;
  }
  
  .table td:first-child {
    background-color: #f8f9fa;
    text-align: left;
    padding-left: 1rem;
  }
  
  .table td:first-child::before {
    display: none;
  }
  
  .table td:last-child {
    text-align: right;
  }
  
  .btn-group {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
