<template>
    <h1>Cotisation Mensuelle</h1>
</template>

<script setup>
import { onMounted } from 'vue';
import api from '../../services/api';

onMounted(() => {
    getCotisationsMensuelles();
})

async function getCotisationsMensuelles() {
    const response = await api.get('/cotisation-mensuelles');
    console.log(response.data);
}


</script>