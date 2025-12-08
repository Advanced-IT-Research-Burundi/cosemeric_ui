<template>
  <div class="">
    <div class="card shadow">
      <div
        class="card-header bg-primary text-white d-flex align-items-center justify-content-between"
      >
        <div>
          <h5 class="mb-0">
            <i class="bi bi-list-check me-2"></i>
            Liste des Cotisations Mensuelles
          </h5>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-success" @click="exportExcel">
            <i class="bi bi-file-earmark-excel me-2"></i>Exporter Excel
          </button>
          <button class="btn btn-danger" @click="exportPDF">
            <i class="bi bi-file-earmark-pdf me-2"></i>Exporter PDF
          </button>
          <button class="btn btn-secondary" @click="openImportModal">
            <i class="bi bi-upload me-2"></i>Importer Excel
          </button>
        </div>
      </div>

      <div class="card-body">
        <!-- Filters -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Matricule</label>
            <input
              v-model="filters.matricule"
              @input="seachOnMatricule"
              type="text"
              class="form-control"
              placeholder="Rechercher par matricule"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Nom</label>
            <input
              v-model="filters.name"
              @change="getCotisationsMensuelles"
              type="text"
              class="form-control"
              placeholder="Rechercher par nom"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Mois</label>
            <input
              v-model="filters.date_cotisation"
              @change="getCotisationsMensuelles"
              type="month"
              class="form-control"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Global</th>
                <th>Retenu</th>
                <th>Date cotisation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in displayedRows" :key="item.id">
                <td>{{ rowIndex(index) }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.matricule }}</td>
                <td class="fw-bold">{{ formatMontant(item.global) }}</td>
                <td>{{ formatMontant(item.retenu) }}</td>
                <td>{{ item.date_cotisation }}</td>
              </tr>
              <tr v-if="displayedRows.length === 0">
                <td colspan="6" class="text-center text-muted">
                  Aucune cotisation trouvée.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (server links if provided, fallback client pagination) -->
        <div class="d-flex justify-content-center align-items-center mt-3">
          <nav v-if="cotisationsMensuelles.links" aria-label="Pagination">
            <ul class="pagination mb-0">
              <li
                v-for="link in cotisationsMensuelles.links"
                :key="link.label"
                class="page-item"
                :class="{ disabled: !link.url, active: link.active }"
              >
                <button
                  class="page-link"
                  v-html="link.label"
                  @click="changePage(link.url)"
                  :disabled="!link.url"
                />
              </li>
            </ul>
          </nav>

          <nav v-else aria-label="Pagination" class="ms-2">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePageClient(currentPage - 1)"
                  >Précédent</a
                >
              </li>
              <li
                v-for="p in totalPagesClient"
                :key="p"
                class="page-item"
                :class="{ active: currentPage === p }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePageClient(p)"
                  >{{ p }}</a
                >
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPagesClient }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePageClient(currentPage + 1)"
                  >Suivant</a
                >
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
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
              <i class="bi bi-upload me-2"></i>Importer un fichier Excel
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
              <label for="fileInput" class="form-label"
                >Sélectionner un fichier</label
              >
              <input
                class="form-control"
                type="file"
                id="fileInput"
                accept=".xlsx,.xls"
                @change="handleFileSelect"
              />
              <div class="form-text">Formats acceptés : .xlsx, .xls</div>
            </div>

            <div v-if="uploadProgress > 0" class="mb-3">
              <label class="form-label">Progression de l'importation</label>
              <div class="progress" style="height: 25px">
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
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="uploadFile"
              :disabled="!selectedFile || uploadProgress > 0"
            >
              <i class="bi bi-cloud-upload me-2"></i>Importer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import api from "../../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const loadingData = ref(false);
const store = useStore();

const filters = ref({
  matricule: "",
  name: "",
  date_cotisation: "",
});

const cotisationsMensuelles = computed(
  () => store.state.cotisationsMensuelles || { data: [], links: null }
);

// client-side pagination fallback
const currentPage = ref(1);
const itemsPerPageClient = ref(10);

const selectedFile = ref(null);
const uploadProgress = ref(0);
const importModal = ref(null);

onMounted(() => {
  getCotisationsMensuelles();
});

async function getCotisationsMensuelles(url = "/cotisation-mensuelles") {
  loadingData.value = true;

  try {
    const params = {
      matricule: filters.value.matricule || undefined,
      name: filters.value.name || undefined,
      date_cotisation: filters.value.date_cotisation || undefined,
    };

    const response = await api.get(url, { params });
    // keep compatibility with axios-style response
    store.state.cotisationsMensuelles = response.data || response;
    loadingData.value = false;
  } catch (error) {
    console.error("Erreur lors du chargement des cotisations :", error);
    loadingData.value = false;
  }
}

function seachOnMatricule() {
  getCotisationsMensuelles();
}

function changePage(url) {
  if (url) getCotisationsMensuelles(url);
}

/* Client-side pagination helpers (fallback when server links not provided) */
const totalPagesClient = computed(() => {
  const total = (cotisationsMensuelles.value.data || []).length;
  return Math.max(1, Math.ceil(total / itemsPerPageClient.value));
});

function changePageClient(page) {
  if (page >= 1 && page <= totalPagesClient.value) currentPage.value = page;
}

const displayedRows = computed(() => {
  const data = cotisationsMensuelles.value.data || [];
  if (cotisationsMensuelles.value.links) return data || [];
  const start = (currentPage.value - 1) * itemsPerPageClient.value;
  return data.slice(start, start + itemsPerPageClient.value);
});

function rowIndex(index) {
  if (cotisationsMensuelles.value.links && cotisationsMensuelles.value.meta) {
    const page = cotisationsMensuelles.value.meta.current_page || 1;
    const per =
      cotisationsMensuelles.value.meta.per_page || displayedRows.value.length;
    return (page - 1) * per + index + 1;
  }
  return (currentPage.value - 1) * itemsPerPageClient.value + index + 1;
}

/* Formatting */
function formatMontant(value) {
  if (value === null || value === undefined || value === 0) return "-";
  return Number(value).toLocaleString("fr-FR") + " FBu";
}

/* Export functions */
function exportExcel() {
  const rows = cotisationsMensuelles.value.data || [];
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "cotisations");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    "cotisations_mensuelles.xlsx"
  );
}

function exportPDF() {
  const rows = cotisationsMensuelles.value.data || [];
  const doc = new jsPDF();
  autoTable(doc, {
    startY: 25,
    head: [["#", "Nom", "Matricule", "Montant (FBu)", "Retenu", "Date"]],
    body: rows.map((r, i) => [
      i + 1,
      r.name || "",
      r.matricule || "",
      r.global ? Number(r.global).toLocaleString("fr-FR") : "-",
      r.retenu ? Number(r.retenu).toLocaleString("fr-FR") : "-",
      r.date_cotisation || "",
    ]),
    styles: { fontSize: 9 },
  });
  doc.text("Cotisations Mensuelles", 14, 15);
  doc.save("cotisations_mensuelles.pdf");
}

/* Import modal and file handling */
function openImportModal() {
  const modalEl = (importModal.value =
    importModal.value || document.getElementById("importModal"));
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
  selectedFile.value = null;
  uploadProgress.value = 0;
}

function handleFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  selectedFile.value = file || null;
}

function uploadFile() {
  if (!selectedFile.value) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const imported = XLSX.utils.sheet_to_json(ws);

      // Map imported rows to expected fields and append locally
      const base = cotisationsMensuelles.value.data || [];
      imported.forEach((row, idx) => {
        base.push({
          id: base.length + 1 + idx,
          name: row.name || row.Nom || row.Membre || "",
          matricule: row.matricule || row.Matricule || "",
          global: Number(row.global || row.Global || row.montant || 0),
          retenu: Number(row.retenu || row.Retenu || 0),
          date_cotisation: row.date_cotisation || row.Date || "",
        });
      });

      // update store (local only)
      store.state.cotisationsMensuelles = {
        ...(store.state.cotisationsMensuelles || {}),
        data: base,
      };
    } catch (err) {
      console.error("Erreur lors de l'importation :", err);
      alert("Impossible de lire le fichier Excel.");
    }
  };

  reader.readAsArrayBuffer(selectedFile.value);

  // Fake progress for UX
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    uploadProgress.value = progress;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        alert("Fichier importé avec succès !");
        const modalEl = document.getElementById("importModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        uploadProgress.value = 0;
        selectedFile.value = null;
      }, 400);
    }
  }, 250);
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 10px;
}
.card-header {
  border-radius: 10px 10px 0 0;
  padding: 0.75rem 1rem;
}
.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}
.form-label {
  font-weight: 600;
}
</style>
