<template>
    <div>
        <h1>Contribution Mensuelle</h1>
        {{ cotisations }}
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import api from '../../services/api';
import { useStore } from 'vuex';
import { computed } from 'vue';

const store = useStore();
onMounted(() => {
    fecthData();
})

const fecthData = async () => {
    api.get('cotisation_mensuelles')
    .then(response => {
        store.state.data.cotisations_mensuelles = response.data;
    })
    .catch(error => {
        console.error(error);
    })
}

const cotisations = computed(() => store.state.data.cotisations_mensuelles);

</script>