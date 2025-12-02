<template>
  <div class="container mt-5">
    <div class="card shadow">
      <div
        class="card-header bg-primary text-white d-flex align-items-center justify-content-between"
      >
        <h4 class="mb-0">
          <i class="bi bi-file-earmark-spreadsheet me-2"></i>
          Importation des Cotisations (Excel)
        </h4>

        <div class="d-flex gap-2">
          <button
            class="btn btn-success"
            @click="exportExcel"
            :disabled="!cotisations.length"
          >
            <i class="bi bi-file-earmark-excel me-2"></i>Exporter Excel
          </button>
          <button
            class="btn btn-danger"
            @click="exportPDF"
            :disabled="!cotisations.length"
          >
            <i class="bi bi-file-earmark-pdf me-2"></i>Exporter PDF
          </button>
          <button class="btn btn-secondary" @click="openImportModal">
            <i class="bi bi-upload me-2"></i>Importer Excel
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="message" class="alert alert-danger">
          {{ message }}
        </div>

        <div class="row g-3 mb-4 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Date de cotisation</label>
            <input type="date" v-model="date_cotisation" class="form-control" />
          </div>

          <div class="col-md-8">
            <p class="mb-1 text-muted">
              Placez ici un aperçu du fichier importé ou ouvrir le modal pour
              sélectionner un fichier Excel.
            </p>
            <div v-if="cotisations.length" class="small text-muted">
              Lignes importées : {{ cotisations.length }}
            </div>
          </div>
        </div>

        <div v-if="cotisations.length" class="table-responsive">
          <table class="table table-hover table-striped align-middle">
            <thead class="table-dark">
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Numero dossier</th>
                <th>Global</th>
                <th>Regle</th>
                <th>Restant</th>
                <th>Retenu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in cotisations" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ c.name }}</td>
                <td>{{ c.matricule }}</td>
                <td>{{ c.nomero_dossier }}</td>
                <td>{{ c.global }}</td>
                <td>{{ c.regle }}</td>
                <td>{{ c.restant }}</td>
                <td>{{ c.retenu }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-4 text-muted">
          Aucun fichier chargé. Cliquez sur "Importer Excel" pour sélectionner
          un fichier.
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3">
          <button
            class="btn btn-outline-secondary"
            @click="clearData"
            :disabled="!cotisations.length"
          >
            Effacer
          </button>
          <button
            class="btn btn-primary"
            @click="saveData"
            :disabled="!cotisations.length"
          >
            Enregistrer vers le serveur
          </button>
        </div>
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
              <label for="fileInput" class="form-label"
                >Sélectionner un fichier</label
              >
              <input
                class="form-control"
                type="file"
                id="fileInput"
                accept=".xlsx,.xls"
                @change="readExcel"
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

            <div v-if="cotisations.length" class="mt-2">
              <div class="small text-muted">
                Aperçu : {{ Math.min(cotisations.length, 5) }} premières lignes
                affichées après fermeture du modal.
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
              @click="closeModalAndKeep"
              :disabled="uploadProgress > 0"
            >
              <i class="bi bi-cloud-check me-2"></i>Terminer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { ref } from "vue";
import api from "../../services/api";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

const cotisations = ref([]);
const date_cotisation = ref("");
const message = ref("");
const uploadProgress = ref(0);
const importModal = ref(null);

function openImportModal() {
  const modalEl = (importModal.value =
    importModal.value || document.getElementById("importModal"));
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
  uploadProgress.value = 0;
  // reset selected file only when user opens modal intentionally
}

function closeModalAndKeep() {
  const modalEl = document.getElementById("importModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}

async function saveData() {
  if (!cotisations.value.length) return;
  try {
    await api.post("importation", {
      cotisations: cotisations.value,
      date_cotisation: date_cotisation.value,
    });
    message.value = "Données importées avec succès";
    // keep data visible; optionally clear after success
  } catch (err) {
    message.value =
      "Erreur lors de l'importation : " +
      (err?.response?.data?.message || err.message);
    console.error(err);
  }
}

function readExcel(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const dataBinary = new Uint8Array(e.target.result);
      const workbook = XLSX.read(dataBinary, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // original mapping logic preserved (skip header rows if file has them)
      const currentData = jsonData.slice(3);

      const travail = currentData
        .map((row) => {
          const ligne = Object.entries(row);
          return {
            name: ligne[0] ? ligne[0][1] : "",
            matricule: ligne[2] ? ligne[2][1] : "",
            nomero_dossier: ligne[2] ? ligne[2][1] : "",
            global: ligne[9] ? ligne[9][1] : "",
            regle: ligne[12] ? ligne[12][1] : "",
            restant: ligne[12] ? ligne[12][1] : "",
            retenu: ligne[18] ? ligne[18][1] : "",
          };
        })
        .filter((e) => e.matricule != "");

      cotisations.value = travail;
      // simulate progress for UX
      simulateProgress();
    } catch (err) {
      console.error("Erreur lors de la lecture du fichier :", err);
      message.value = "Impossible de lire le fichier Excel.";
    }
  };

  reader.readAsArrayBuffer(file);
}

function simulateProgress() {
  uploadProgress.value = 0;
  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    uploadProgress.value = progress;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        uploadProgress.value = 0;
        // automatically close modal after short delay (user can also close manually)
        const modalEl = document.getElementById("importModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }, 400);
    }
  }, 200);
}

function clearData() {
  cotisations.value = [];
  message.value = "";
  date_cotisation.value = "";
}

/* Exports */
function exportExcel() {
  const rows = cotisations.value || [];
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "cotisations");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    "import_cotisations.xlsx"
  );
}

function exportPDF() {
  const rows = cotisations.value || [];
  const doc = new jsPDF();
  autoTable(doc, {
    startY: 25,
    head: [["#", "Nom", "Matricule", "Global", "Retenu", "Date"]],
    body: rows.map((r, i) => [
      i + 1,
      r.name || "",
      r.matricule || "",
      r.global || "",
      r.retenu || "",
      date_cotisation.value || "",
    ]),
    styles: { fontSize: 9 },
  });
  doc.text("Export - Cotisations importées", 14, 15);
  doc.save("import_cotisations.pdf");
}
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
.table thead th {
  border: none;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}
.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}
.btn {
  border-radius: 8px;
}
.form-control {
  border-radius: 8px;
}
</style>
