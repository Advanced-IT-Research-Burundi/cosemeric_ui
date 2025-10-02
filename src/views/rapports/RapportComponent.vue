<template>
  <div class="container mt-5">
    <!-- Carte principale -->
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="bi bi-file-earmark-text me-2"></i>
          Gestion des Rapports COSERMIC
        </h4>
      </div>
      <div class="card-body">
        <!-- Section des filtres -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Rechercher un membre</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Nom du membre..."
              v-model="filters.search"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Période</label>
            <input 
              type="month" 
              class="form-control"
              v-model="filters.period"
            >
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Type de transaction</label>
            <select class="form-select" v-model="filters.type">
              <option value="">Tous les types</option>
              <option value="cotisation">Cotisation</option>
              <option value="credit">Crédit</option>
              <option value="dette">Dette</option>
              <option value="assistance">Assistance</option>
            </select>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="d-flex gap-2 mb-4 flex-wrap">
          <button class="btn btn-success" @click="exportExcel">
            <i class="bi bi-file-earmark-excel me-2"></i>
            Exporter Excel
          </button>
          <button class="btn btn-danger" @click="exportPDF">
            <i class="bi bi-file-earmark-pdf me-2"></i>
            Exporter PDF
          </button>
          <button class="btn btn-secondary" @click="openImportModal">
            <i class="bi bi-upload me-2"></i>
            Importer Excel
          </button>
        </div>

        <!-- Tableau des données -->
        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle">
            <thead class="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Membre</th>
                <th scope="col">Type</th>
                <th scope="col">Montant</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="item.id">
                <th scope="row">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</th>
                <td>{{ item.membre }}</td>
                <td>
                  <span :class="getTypeBadgeClass(item.type)">
                    {{ item.type }}
                  </span>
                </td>
                <td class="fw-bold">{{ formatCurrency(item.montant) }}</td>
                <td>{{ item.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav aria-label="Pagination des rapports">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                Précédent
              </a>
            </li>
            <li 
              v-for="page in totalPages" 
              :key="page"
              class="page-item" 
              :class="{ active: currentPage === page }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                Suivant
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Modal d'importation -->
    <div 
      class="modal fade" 
      id="importModal" 
      tabindex="-1" 
      aria-labelledby="importModalLabel" 
      aria-hidden="true"
      ref="importModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-secondary text-white">
            <h5 class="modal-title" id="importModalLabel">
              <i class="bi bi-upload me-2"></i>
              Importer un fichier Excel
            </h5>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="fileInput" class="form-label">Sélectionner un fichier</label>
              <input 
                class="form-control" 
                type="file" 
                id="fileInput"
                accept=".xlsx,.xls"
                @change="handleFileSelect"
              >
              <div class="form-text">Formats acceptés : .xlsx, .xls</div>
            </div>
            
            <!-- Barre de progression -->
            <div v-if="uploadProgress > 0" class="mb-3">
              <label class="form-label">Progression de l'importation</label>
              <div class="progress" style="height: 25px;">
                <div 
                  class="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="{ width: uploadProgress + '%' }"
                  :aria-valuenow="uploadProgress" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {{ uploadProgress }}%
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="uploadFile"
              :disabled="!selectedFile || uploadProgress > 0"
            >
              <i class="bi bi-cloud-upload me-2"></i>
              Importer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportManager',
  data() {
    return {
      // Filtres
      filters: {
        search: '',
        period: '',
        type: ''
      },
      // Données fictives
      transactions: [
        { id: 1, membre: 'Jean Dupont', type: 'cotisation', montant: 5000, date: '2024-01-15' },
        { id: 2, membre: 'Marie Martin', type: 'credit', montant: 15000, date: '2024-01-18' },
        { id: 3, membre: 'Paul Durand', type: 'dette', montant: 8000, date: '2024-01-20' },
        { id: 4, membre: 'Sophie Bernard', type: 'assistance', montant: 3000, date: '2024-01-22' },
        { id: 5, membre: 'Luc Petit', type: 'cotisation', montant: 5000, date: '2024-02-05' },
        { id: 6, membre: 'Emma Rousseau', type: 'credit', montant: 20000, date: '2024-02-10' },
        { id: 7, membre: 'Thomas Laurent', type: 'dette', montant: 12000, date: '2024-02-15' },
        { id: 8, membre: 'Claire Simon', type: 'assistance', montant: 4500, date: '2024-02-20' },
        { id: 9, membre: 'Nicolas Michel', type: 'cotisation', montant: 5000, date: '2024-03-01' },
        { id: 10, membre: 'Julie Lefebvre', type: 'credit', montant: 18000, date: '2024-03-08' },
        { id: 11, membre: 'Antoine Moreau', type: 'dette', montant: 9500, date: '2024-03-12' },
        { id: 12, membre: 'Camille Garcia', type: 'assistance', montant: 3500, date: '2024-03-18' }
      ],
      // Pagination
      currentPage: 1,
      itemsPerPage: 5,
      // Import
      selectedFile: null,
      uploadProgress: 0
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.transactions.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.transactions.length / this.itemsPerPage);
    }
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getTypeBadgeClass(type) {
      const badges = {
        cotisation: 'badge bg-primary',
        credit: 'badge bg-success',
        dette: 'badge bg-warning text-dark',
        assistance: 'badge bg-info text-dark'
      };
      return badges[type] || 'badge bg-secondary';
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'BIF' 
      }).format(amount);
    },
    exportExcel() {
      alert('Export Excel en cours... (fonctionnalité à implémenter)');
    },
    exportPDF() {
      alert('Export PDF en cours... (fonctionnalité à implémenter)');
    },
    openImportModal() {
      const modalElement = this.$refs.importModal;
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
      this.selectedFile = null;
      this.uploadProgress = 0;
    },
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (!this.selectedFile) return;
      
      // Simulation d'upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        this.uploadProgress = progress;
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            alert('Fichier importé avec succès !');
            const modalElement = this.$refs.importModal;
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();
            this.uploadProgress = 0;
            this.selectedFile = null;
          }, 500);
        }
      }, 300);
    }
  }
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0;
  padding: 1.25rem;
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  border: none;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.pagination .page-link {
  border-radius: 6px;
  margin: 0 3px;
  border: 1px solid #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  border-radius: 12px 12px 0 0;
}

.btn {
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
}

.form-control, .form-select {
  border-radius: 8px;
}
</style>