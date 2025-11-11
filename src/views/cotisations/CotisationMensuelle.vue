<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Liste des Cotisations Mensuelles</h2>

    <!-- Barre de recherche -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <input
        v-model="filters.matricule"
        @input="getCotisationsMensuelles"
        type="text"
        placeholder="Rechercher par matricule"
        class="border p-2 rounded w-60"
      />
      <input
        v-model="filters.name"
        @input="getCotisationsMensuelles"
        type="text"
        placeholder="Rechercher par nom"
        class="border p-2 rounded w-60"
      />
      <input
        v-model="filters.date_cotisation"
        @change="getCotisationsMensuelles"
        type="month"
        class="border p-2 rounded"
      />
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="border p-2 text-left">#</th>
            <th class="border p-2 text-left">Nom</th>
            <th class="border p-2 text-left">Matricule</th>
            <th class="border p-2 text-left">Global</th>
            <th class="border p-2 text-left">Retenu</th>
            <th class="border p-2 text-left">Date cotisation</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in cotisationsMensuelles.data"
            :key="item.id"
            class="hover:bg-gray-50"
          >
            <td class="border p-2">{{ index + 1 }}</td>
            <td class="border p-2">{{ item.name }}</td>
            <td class="border p-2">{{ item.matricule }}</td>
            <td class="border p-2">{{ formatMontant(item.global) }}</td>
            <td class="border p-2">{{ formatMontant(item.retenu) }}</td>
            <td class="border p-2">{{ item.date_cotisation }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="cotisationsMensuelles.links" class="flex justify-center mt-4 space-x-2">
      <button
        v-for="link in cotisationsMensuelles.links"
        :key="link.label"
        @click="changePage(link.url)"
        v-html="link.label"
        :disabled="!link.url"
        class="px-3 py-1 border rounded"
        :class="{
          'bg-blue-500 text-white': link.active,
          'bg-gray-100 text-gray-600': !link.active
        }"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'
import { useStore } from 'vuex'

const store = useStore()

const filters = ref({
  matricule: '',
  name: '',
  date_cotisation: ''
})

const cotisationsMensuelles = computed(() => store.state.cotisationsMensuelles || { data: [] })

onMounted(() => {
  getCotisationsMensuelles()
})

/**
 * Appel API avec filtres
 */
async function getCotisationsMensuelles(url = '/cotisation-mensuelles') {
  try {
    const params = {
      matricule: filters.value.matricule || undefined,
      name: filters.value.name || undefined,
      date_cotisation: filters.value.date_cotisation || undefined
    }

    const response = await api.get(url, { params })
    store.state.cotisationsMensuelles = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des cotisations :', error)
  }
}

/**
 * Changement de page
 */
function changePage(url) {
  if (url) getCotisationsMensuelles(url)
}

/**
 * Format d'affichage des montants
 */
function formatMontant(value) {
  if (!value) return '-'
  return Number(value).toLocaleString('fr-FR') + ' FBu'
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
</style>
