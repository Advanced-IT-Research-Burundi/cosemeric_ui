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
    <div class="card">
      <div class="card-body p-0">
        <!-- Search and Filter Bar -->
        <div class="row g-3 p-3 border-bottom">
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
                v-if="searchQuery"
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
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="sortBy" class="form-select" @change="applyFilters">
              <option value="nom_asc">Trier par nom (A-Z)</option>
              <option value="nom_desc">Trier par nom (Z-A)</option>
              <option value="date_asc">Plus ancien d'abord</option>
              <option value="date_desc">Plus récent d'abord</option>
            </select>
          </div>
        </div>

        <!-- Members Table -->
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="max-w-25">Membre</th>
                <th>Matricule</th>
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
              <tr v-else-if="members.length === 0">
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
              <tr 
                v-for="member in members" 
                :key="member.id" 
                class="cursor-pointer"
                @click="viewMember(member.id)"
              >
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar me-3">
                      <div class="avatar-text bg-light text-dark">
                        {{ getInitials(`${member.prenom} ${member.nom}`) }}
                      </div>
                    </div>
                    <div class="tr-width">
                      <h6 class="mb-0 text-truncate-1">{{ member.prenom }} {{ member.nom }}</h6>
                      <small class="text-muted">ID: {{ member.id }}</small>
                    </div>
                  </div>
                </td>
                <td class="tr-width">
                  <small class="text-muted text-truncate-1">{{ member.matricule }}</small>
                </td>
                <td>
                  <div>{{ member.email }}</div>
                  <small class="text-muted">{{ member.telephone || 'Aucun téléphone' }}</small>
                </td>
                <td>
                  <span class="badge" :class="getStatusClass(member.statut)">
                    {{ formatStatus(member.statut) }}
                  </span>
                </td>
                <td>{{ formatDate(member.date_adhesion) }}</td>
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
        <div 
          v-if="pagination.total > 0" 
          class="d-flex justify-content-between align-items-center p-3 border-top"
        >
          <div class="text-muted">
            Affichage de <span class="fw-semibold">{{ pagination.from }}</span> à 
            <span class="fw-semibold">{{ pagination.to }}</span> sur 
            <span class="fw-semibold">{{ pagination.total }}</span> membres
          </div>
          
          <nav>
            <ul class="pagination mb-0">
              <li 
                class="page-item" 
                :class="{ 'disabled': pagination.current_page === 1 }"
              >
                <button 
                  class="page-link" 
                  @click="changePage(pagination.current_page - 1)" 
                  :disabled="pagination.current_page === 1"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item"
                :class="{ 'active': page === pagination.current_page }"
              >
                <button 
                  class="page-link" 
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </li>
              
              <li 
                class="page-item" 
                :class="{ 'disabled': pagination.current_page === pagination.last_page }"
              >
                <button 
                  class="page-link" 
                  @click="changePage(pagination.current_page + 1)" 
                  :disabled="pagination.current_page === pagination.last_page"
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
            >
              <option value="15">15</option>
              <option value="30">30</option>
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

export default {
  name: 'AllMembers',
  data() {
    return {
      loading: false,
      members: [],
      searchQuery: '',
      statusFilter: '',
      sortBy: 'nom_asc',
      currentPage: 1,
      itemsPerPage: 15,
      showDeleteModal: false,
      memberToDelete: null,
      deleting: false,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0
      },
      error: null
    };
  },
  computed: {
    filteredMembers() {
      return this.members;
    },
    paginatedMembers() {
      return this.filteredMembers;
    },
    totalPages() {
      return this.pagination.last_page || 1;
    },
    visiblePages() {
      const range = [];
      const maxVisible = 5;
      let start = Math.max(1, this.pagination.current_page - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;

      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      return range;
    }
  },
  methods: {
    async fetchMembers() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.currentPage,
          per_page: this.itemsPerPage,
          search: this.searchQuery,
          status: this.statusFilter,
          sort: this.sortBy
        };

        const response = await api.get('/membres', { params });
        
        if (response.success) {
          this.members = response.data.data;
          this.pagination = {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: parseInt(response.data.per_page),
            total: response.data.total,
            from: response.data.from,
            to: response.data.to
          };
        } else {
          throw new Error(response.data.message || 'Erreur lors du chargement des membres');
        }
      } catch (error) {
        alert(error);
        console.error('Error fetching members:', error);
        
        // Enhanced error logging
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Status code:', error.response.status);
          console.error('Headers:', error.response.headers);
          
          if (error.response.status === 401) {
            this.error = 'Non autorisé. Veuillez vous reconnecter.';
            // Optionally redirect to login
            this.$router.push('/login');
          } else if (error.response.status === 403) {
            this.error = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
          } else if (error.response.status === 404) {
            this.error = 'Endpoint non trouvé. Veuillez vérifier l\'URL de l\'API.';
          } else if (error.response.status >= 500) {
            this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else {
            this.error = error.response.data?.message || 'Erreur lors du chargement des membres';
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          this.error = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          this.error = 'Erreur lors de la configuration de la requête';
        }
      } finally {
        this.loading = false;
      }
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
      this.sortBy = 'nom_asc';
      this.currentPage = 1;
      this.applyFilters();
    },
    viewMember(id) {
      this.$router.push(`/members/${id}`);
    },
    editMember(id) {
      this.$router.push(`/members/${id}/edit`);
    },
    addMember() {
      this.$router.push('/members/new');
    },
    confirmDelete(member) {
      this.memberToDelete = member;
      this.showDeleteModal = true;
    },
    async deleteMember() {
      if (!this.memberToDelete) return;

      this.deleting = true;
      try {
        await api.delete(`/membres/${this.memberToDelete.id}`);
        this.showDeleteModal = false;
        this.memberToDelete = null;
        this.fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        this.error = error.response?.data?.message || 'Erreur lors de la suppression du membre';
      } finally {
        this.deleting = false;
      }
    },
    getInitials(name) {
      if (!name) return '??';
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    formatStatus(status) {
      const statusMap = {
        'actif': 'Actif',
        'inactif': 'Inactif',
        'en_attente': 'En attente',
        'suspendu': 'Suspendu'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      return {
        'bg-success': status === 'actif',
        'bg-warning': status === 'en_attente',
        'bg-danger': status === 'inactif' || status === 'suspendu',
        'bg-secondary': !['actif', 'en_attente', 'inactif', 'suspendu'].includes(status)
      };
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchMembers();
      }
    },
    changeItemsPerPage() {
      this.currentPage = 1;
      this.fetchMembers();
    }
  },
  watch: {
    currentPage: 'fetchMembers',
    itemsPerPage: 'changeItemsPerPage'
  },
  created() {
    this.fetchMembers();
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

.btn-sm {
  padding: 0.25rem 0.5rem;
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
