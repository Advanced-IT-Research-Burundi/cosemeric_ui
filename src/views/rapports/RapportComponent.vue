<template>
  <div class="container mt-5">
    <!-- Carte principale -->
    <div class="card shadow border-0">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <h4 class="mb-0">
          <i class="bi bi-file-earmark-bar-graph me-2"></i>
          Rapports & Transactions
        </h4>
        <span class="badge bg-white text-primary rounded-pill">
          {{ filteredTransactions.length }} opérations
        </span>
      </div>
      
      <div class="card-body bg-light">
        <!-- Section des filtres -->
        <div class="card mb-4 border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold text-muted small text-uppercase">Recherche</label>
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
                  <input
                    type="text"
                    class="form-control border-start-0 ps-0"
                    placeholder="Nom du membre, référence..."
                    v-model="filters.search"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold text-muted small text-uppercase">Période</label>
                <input type="month" class="form-control" v-model="filters.period" />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold text-muted small text-uppercase">Type de transaction</label>
                <select class="form-select" v-model="filters.type">
                  <option value="">Toutes les transactions</option>
                  <option value="cotisation">Cotisations</option>
                  <option value="credit">Crédits accordés</option>
                  <option value="remboursement">Remboursements reçus</option>
                  <option value="assistance">Assistances versées</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Résumé financier (KPIs) -->
        <div class="row g-3 mb-4" v-if="!loading">
           <div class="col-md-3">
              <div class="card border-0 shadow-sm border-start border-4 border-success">
                 <div class="card-body p-3">
                    <small class="text-muted text-uppercase fw-bold">Entrées (Cotis. + Remb.)</small>
                    <h5 class="mb-0 text-success fw-bold">{{ formatCurrency(stats.income) }}</h5>
                 </div>
              </div>
           </div>
           <div class="col-md-3">
              <div class="card border-0 shadow-sm border-start border-4 border-danger">
                 <div class="card-body p-3">
                    <small class="text-muted text-uppercase fw-bold">Sorties (Crédits + Assist.)</small>
                    <h5 class="mb-0 text-danger fw-bold">{{ formatCurrency(stats.expense) }}</h5>
                 </div>
              </div>
           </div>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-between mb-3 flex-wrap gap-2">
          <div class="d-flex gap-2">
            <button class="btn btn-success text-white" @click="exportExcel" :disabled="loading || filteredTransactions.length === 0">
              <i class="bi bi-file-excel me-2"></i>Excel
            </button>
            <button class="btn btn-danger text-white" @click="exportPDF" :disabled="loading || filteredTransactions.length === 0">
              <i class="bi bi-file-pdf me-2"></i>PDF
            </button>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary" @click="openImportModal">
              <i class="bi bi-cloud-upload me-2"></i>Importer
            </button>
            <button class="btn btn-primary" @click="fetchAllData" :disabled="loading">
               <i class="bi bi-arrow-clockwise me-2" :class="{'spin-icon': loading}"></i>
               {{ loading ? 'Chargement...' : 'Actualiser' }}
            </button>
          </div>
        </div>

        <!-- Tableau -->
        <div class="card shadow-sm border-0 overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="ps-4">Date</th>
                  <th scope="col">Membre</th>
                  <th scope="col">Type</th>
                  <th scope="col">Détails</th>
                  <th scope="col" class="text-end pe-4">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                    <td colspan="5" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="text-muted mt-2 mb-0">Récupération des données...</p>
                    </td>
                </tr>
                <tr v-else-if="paginatedData.length === 0">
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                        Aucune donnée ne correspond à vos filtres.
                    </td>
                </tr>
                <tr v-else v-for="item in paginatedData" :key="item.uniqueId">
                  <td class="ps-4 text-nowrap">{{ formatDate(item.date) }}</td>
                  <td class="fw-medium">{{ item.membre }}</td>
                  <td>
                    <span :class="getTypeBadgeClass(item.type)">
                      {{ item.type_label }}
                    </span>
                  </td>
                  <td><small class="text-muted">{{ item.details }}</small></td>
                  <td class="text-end pe-4 fw-bold" :class="getAmountColor(item.type)">
                      {{ formatCurrency(item.montant) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="card-footer bg-white py-3 border-0" v-if="totalPages > 1 && !loading">
            <nav>
              <ul class="pagination justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'importation -->
    <div class="modal fade" id="importModal" tabindex="-1" ref="importModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Importer Excel</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4 text-center p-4 border border-dashed rounded bg-light">
               <i class="bi bi-cloud-arrow-up fs-1 text-primary mb-3"></i>
               <!-- Affichage conditionnel du nom du fichier ou du message d'instruction -->
               <template v-if="selectedFile">
                   <p class="mb-2 fw-bold text-success">Fichier sélectionné : {{ selectedFile.name }}</p>
               </template>
               <template v-else>
                   <p class="mb-2">Glissez votre fichier ici ou cliquez pour parcourir</p>
               </template>
               <!-- L'input de type file est toujours présent mais son style peut le rendre invisible sur certaines implémentations de drag-drop (ici il est visible) -->
               <input class="form-control" type="file" accept=".xlsx,.xls" @change="handleFileSelect" />
            </div>
            <!-- Ligne de confirmation des formats Excel -->
            <p class="text-center text-muted small mt-2 mb-0">Formats acceptés : Fichier Excel (.xlsx, .xls)</p>
            <!-- Fin de la ligne de confirmation -->
            <div v-if="uploadProgress > 0">
              <div class="d-flex justify-content-between mb-1">
                  <small>Importation en cours...</small>
                  <small>{{ uploadProgress }}%</small>
              </div>
              <div class="progress" style="height: 8px">
                <div class="progress-bar bg-primary" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" @click="uploadFile" :disabled="!selectedFile || uploadProgress > 0">
              Importer les données
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import api from "../../services/api";

export default {
  name: "ReportManager",
  data() {
    return {
      loading: false,
      rawTransactions: [],
      filters: {
        search: "",
        period: "", // YYYY-MM
        type: "",
      },
      currentPage: 1,
      itemsPerPage: 10,
      selectedFile: null,
      uploadProgress: 0,
    };
  },
  computed: {
    filteredTransactions() {
      let data = this.rawTransactions;

      // Filtre Type
      if (this.filters.type) {
        data = data.filter((item) => item.type === this.filters.type);
      }

      // Filtre Recherche
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        data = data.filter((item) =>
          (item.membre || '').toLowerCase().includes(searchLower) ||
          (item.details || '').toLowerCase().includes(searchLower)
        );
      }

      // Filtre Période
      if (this.filters.period) {
        data = data.filter((item) => item.date && item.date.startsWith(this.filters.period));
      }

      // Tri: Plus récent en premier
      return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTransactions.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    },
    visiblePages() {
      let pages = [];
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, this.currentPage + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    },
    stats() {
        // Calcul simple pour le résumé financier
        return this.filteredTransactions.reduce((acc, item) => {
            if(['cotisation', 'remboursement'].includes(item.type)) {
                acc.income += item.montant;
            } else {
                acc.expense += item.montant;
            }
            return acc;
        }, { income: 0, expense: 0 });
    }
  },
  methods: {
    async fetchAllData() {
      this.loading = true;
      this.rawTransactions = [];
      // On demande beaucoup de données pour le rapport global (pagination client-side)
      const params = { per_page: 1000 }; 

      try {
        const [cotisRes, creditsRes, assistRes, rembRes] = await Promise.allSettled([
          api.get('/cotisations', { params }),
          api.get('/credits', { params }),
          api.get('/assistances', { params }),
          api.get('/remboursements', { params })
        ]);

        let allData = [];

        // 1. Cotisations (Structure basée sur ContributionView.vue)
        if (cotisRes.status === 'fulfilled') {
           const data = this.extractData(cotisRes.value);
           allData.push(...data.map(i => ({
               uniqueId: `cot-${i.id}`,
               membre: i.membre?.nom || 'Inconnu',
               type: 'cotisation',
               type_label: 'Cotisation',
               montant: parseFloat(i.montant || 0),
               date: i.created_at || i.date,
               details: this.getModePaiementLabel(i.mode_paiement)
           })));
        }

        // 2. Crédits (Structure basée sur Credits.vue)
        if (creditsRes.status === 'fulfilled') {
           const data = this.extractData(creditsRes.value);
           allData.push(...data.map(i => ({
               uniqueId: `cred-${i.id}`,
               membre: i.membre?.nom || `Membre #${i.membre_id}`,
               type: 'credit',
               type_label: 'Crédit Accordé',
               montant: parseFloat(i.montant_accorde || 0), // Champ spécifique Credits.vue
               date: i.created_at,
               details: `${i.duree_mois} mois à ${i.taux_interet}%`
           })));
        }

        // 3. Assistances (Structure basée sur AssistanceView.vue)
        if (assistRes.status === 'fulfilled') {
           const data = this.extractData(assistRes.value);
           allData.push(...data.map(i => ({
               uniqueId: `assist-${i.id}`,
               membre: i.membre?.nom || 'Inconnu',
               type: 'assistance',
               type_label: 'Assistance',
               montant: parseFloat(i.montant || 0),
               date: i.date_versement || i.created_at,
               details: i.type_assistance?.nom || 'Assistance sociale'
           })));
        }

        // 4. Remboursements (Structure basée sur Remboursements.vue)
        if (rembRes.status === 'fulfilled') {
           const data = this.extractData(rembRes.value);
           allData.push(...data.map(i => {
             // Essayer de trouver le nom via la relation imbriquée si elle existe
             const nomMembre = i.membre?.nom || i.credit?.membre?.nom || 'N/A';
             return {
               uniqueId: `remb-${i.id}`,
               membre: nomMembre,
               type: 'remboursement',
               type_label: 'Remboursement',
               montant: parseFloat(i.montant_paye || 0), // Champ spécifique Remboursements.vue
               date: i.date_paiement || i.created_at,
               details: `Crédit #${i.credit_id} - Échéance ${i.numero_echeance}`
             };
           }));
        }

        this.rawTransactions = allData;

      } catch (error) {
        console.error("Erreur chargement global:", error);
      } finally {
        this.loading = false;
      }
    },

    extractData(response) {
        // Helper pour gérer les structures de réponse API (soit tableau direct, soit .data, soit .data.data)
        if (!response) return [];
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.data)) return response.data.data;
        return [];
    },

    // --- Helpers de formatage ---
    getModePaiementLabel(mode) {
        const modes = { 1: "Espèces", 2: "Virement", 3: "Chèque", 4: "Mobile Money" };
        return modes[mode] || "Autre";
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "BIF", minimumFractionDigits: 0 }).format(amount || 0);
    },
    formatDate(dateStr) {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("fr-FR");
    },
    getTypeBadgeClass(type) {
      const classes = {
        cotisation: "badge bg-primary-subtle text-primary border border-primary-subtle",
        credit: "badge bg-danger-subtle text-danger border border-danger-subtle",
        remboursement: "badge bg-success-subtle text-success border border-success-subtle",
        assistance: "badge bg-warning-subtle text-dark border border-warning-subtle",
      };
      return classes[type] || "badge bg-secondary";
    },
    getAmountColor(type) {
        // Vert pour ce qui rentre dans la caisse, Rouge pour ce qui sort
        if (['cotisation', 'remboursement'].includes(type)) return 'text-success';
        return 'text-danger';
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    },

    // --- Export Excel ---
    exportExcel() {
      const exportData = this.filteredTransactions.map(item => ({
          Date: this.formatDate(item.date),
          Membre: item.membre,
          Type: item.type_label,
          Montant: item.montant,
          Détails: item.details
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rapport COSERMIC");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), `Rapport_COSERMIC_${new Date().toISOString().slice(0,10)}.xlsx`);
    },

    // --- Export PDF ---
    exportPDF() {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Rapport Général COSERMIC", 14, 20);
      doc.setFontSize(10);
      doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 14, 28);
      
      if(this.filters.period) doc.text(`Période filtrée: ${this.filters.period}`, 14, 34);

      const tableBody = this.filteredTransactions.map(item => [
          this.formatDate(item.date),
          item.membre,
          item.type_label,
          item.montant.toLocaleString('fr-FR') + ' BIF',
          item.details
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Membre', 'Type', 'Montant', 'Détails']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [13, 110, 253] }
      });

      doc.save(`Rapport_COSERMIC_${new Date().toISOString().slice(0,10)}.pdf`);
    },

    // --- Import Excel (Simulation) ---
    openImportModal() {
      const modal = new bootstrap.Modal(this.$refs.importModal);
      modal.show();
      this.selectedFile = null;
      this.uploadProgress = 0;
    },
    handleFileSelect(event) {
        this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (!this.selectedFile) return;
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const imported = XLSX.utils.sheet_to_json(ws);
            
            // Simulation d'ajout aux données locales
            const newItems = imported.map((row, idx) => ({
                uniqueId: `imp-${Date.now()}-${idx}`,
                membre: row.Membre || row.membre || 'Importé',
                type: 'cotisation', // Par défaut
                type_label: 'Importé',
                montant: parseFloat(row.Montant || row.montant || 0),
                date: row.Date || row.date || new Date().toISOString(),
                details: 'Via Import Excel'
            }));

            this.rawTransactions = [...newItems, ...this.rawTransactions];

            // Animation de chargement
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                this.uploadProgress = progress;
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                         bootstrap.Modal.getInstance(this.$refs.importModal).hide();
                         // Modification pour utiliser une modale custom ou une alerte temporaire si le cadre le permet,
                         // mais en gardant l'alerte simple pour l'instant car elle était déjà là.
                         // Dans un environnement réel, il faudrait remplacer alert() par un toast ou un modal.
                         alert(`${newItems.length} lignes importées avec succès (Localement).`); 
                         this.uploadProgress = 0;
                    }, 500);
                }
            }, 100);

        } catch (err) {
            // Modification pour utiliser une alerte simple pour l'instant
            alert("Erreur de lecture du fichier.");
        }
      };
      reader.readAsArrayBuffer(this.selectedFile);
    }
  },
  mounted() {
    this.fetchAllData();
  }
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}
.spin-icon {
    animation: spin 1s infinite linear;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.pagination .page-link {
    color: #333;
    border: none;
    margin: 0 2px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pagination .page-item.active .page-link {
    background-color: #0d6efd;
    color: white;
}
.border-dashed {
    border-style: dashed !important;
}
/* Badges modernes */
.badge {
    padding: 0.5em 0.8em;
    font-weight: 600;
}
</style>