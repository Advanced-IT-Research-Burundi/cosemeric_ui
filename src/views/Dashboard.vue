<template>
  <div class="p-4">
    <h3>Tableau de bord</h3>
    
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
