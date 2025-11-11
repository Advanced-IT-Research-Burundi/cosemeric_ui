<template>
  <div class="p-4">
    <h2>Lecture d’un fichier Excel</h2>
    <div v-if="message" class="alert alert-danger">
      {{ message }}
    </div>
    <div class="d-flex gap-2 align-items-center justify-content-center">
      <div>
        <label for="date">Date de cotisation</label>
        <input type="date" v-model="date_cotisation" class="form-control form-control-sm" />
      </div>
      <div>
        <label for="file">Fichier Excel</label>
        <input type="file" @change="readExcel" accept=".xlsx, .xls" />
      </div>
      <button @click="saveData">Enregistrement</button>
    </div>
    <div v-if="cotisations.length" class="mt-4">
      <h3>Contenu du fichier :</h3>
      <table border="1" cellpadding="6" class="table table-bordered table-striped table-hover table-sm table-responsive">
        <thead>
          <tr>
            <th>name</th>
            <th>matricule</th>
            <th>nomero_dossier</th>
            <th>global</th>
            <th>regle</th>
            <th>restant</th>
            <th>retenu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cotisation, i) in cotisations" :key="i">
            <td>{{ cotisation.name }}</td>
            <td>{{ cotisation.matricule }}</td>
            <td>{{ cotisation.nomero_dossier }}</td>
            <td>{{ cotisation.global }}</td>
            <td>{{ cotisation.regle }}</td>
            <td>{{ cotisation.restant }}</td>
            <td>{{ cotisation.retenu }}</td>
          </tr>
        </tbody>
      </table>
    </div>
   
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { ref } from "vue";
import api from "../../services/api";

const data = ref([]);      // Contenu du fichier Excel (tableau d’objets)
const columns = ref([]);   // Noms des colonnes
const cotisations = ref([])
const date_cotisation = ref(new Date())
const message = ref("")
const saveData = async () => {
    console.log("saveData" , cotisations.value.length)
     await api.post("importation", {
        cotisations : cotisations.value,
        date_cotisation : date_cotisation.value
    }).then(response => {
        console.log("response",response.data)
        message.value = "Donnees importees avec succes"
    }).catch(error => {
        
        message.value = "Erreur lors de l'importation " + error?.response?.data?.message
    });


}
// Fonction pour lire le fichier Excel
function readExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const dataBinary = new Uint8Array(e.target.result);
    const workbook = XLSX.read(dataBinary, { type: "array" });

    // Lecture de la première feuille
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Conversion en JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    data.value = jsonData;
   const currentData = jsonData.slice(3) ;

    const travail = currentData.map(e => {
        const ligne = Object.entries(e)
        return {
            name : ligne[0][1],
            matricule : ligne[2][1],
            nomero_dossier : ligne[2][1],
            global : ligne[9][1],
            regle : ligne[12][1],
            restant : ligne[12][1],
            retenu : ligne[18][1],
        }
    })
    .filter(e => e.matricule != "" )
    ;
   // console.log("jsonData",travail);
    cotisations.value = travail
    // Récupération des colonnes
    columns.value = Object.keys(jsonData[5] || {});
  };

  reader.readAsArrayBuffer(file);
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  margin-top: 10px;
  width: 100%;
}
th {
  background-color: #f0f0f0;
}
</style>
