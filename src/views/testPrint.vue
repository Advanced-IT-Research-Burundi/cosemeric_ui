<template>
  <div>
    <button @click="printPage">Imprimer </button>
    <button @click="generatePdfA">Generate PDF  </button>
    <button @click="generateExcel"> Generate Excel File  </button>
    <div id="bonjour">
        <h1>BONJOUR LE MONDE</h1>
    </div>
    
  </div>
</template>

<script setup >
import usePrint from '../utils/usePrint';
const {print , generatePdf , exportToExcel } = usePrint();

function printPage(){
  print("bonjour")
}
function generatePdfA(){
  generatePdf("bonjour")
}

function generateExcel(){
  exportToExcel(['A', 'B', 'C']);
}


</script>
