<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="mb-0">Remboursements Mensuel</h1>
        </div>

        <div class="card">
            <AdvancedTable
                :data="tableData"
                :columns="columns"
                :loading="loading"
                search-placeholder="Rechercher par nom, matricule..."
                no-data-message="Aucun remboursement trouvé"
                :show-filters="true"
                :has-actions="false"
                row-key="id"
                @search="handleSearch"
                @sort="handleSort"
                @page-change="handlePageChange"
                @per-page-change="handlePerPageChange"
            >
                <template #column-global="{ value }">
                    {{ formatMoney(value) }}
                </template>
                <template #column-regle="{ value }">
                    {{ formatMoney(value) }}
                </template>
                <template #column-restant="{ value }">
                    {{ formatMoney(value) }}
                </template>
                <template #column-retenu="{ value }">
                    {{ formatMoney(value) }}
                </template>
            </AdvancedTable>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { useStore } from 'vuex';
import AdvancedTable from '../../components/advancedTable/AdvancedTable.vue';

const store = useStore();
const loading = ref(false);

const queryParams = ref({
    page: 1,
    per_page: 15,
    search: "",
    sort_field: "",
    sort_order: "asc",
});

const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "nomero_dossier", label: "No. Dossier", sortable: true },
    { key: "name", label: "Nom & Prénom", sortable: true, filterable: true },
    { key: "matricule", label: "Matricule", sortable: true, filterable: true },
    { key: "global", label: "Global", sortable: true },
    { key: "regle", label: "Réglé", sortable: true },
    { key: "restant", label: "Restant", sortable: true },
    { key: "retenu", label: "Retenu", sortable: true },
    { key: "date_cotisation", label: "Date", sortable: true },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const params = {
            page: queryParams.value.page,
            per_page: queryParams.value.per_page,
            search: queryParams.value.search,
            sort_field: queryParams.value.sort_field,
            sort_order: queryParams.value.sort_order,
        };

        const response = await api.get('remboursements_mensuelles', { params });
        store.state.data.remboursements_mensuels = response.data;
    } catch (error) {
        console.error("Erreur lors du chargement des remboursements:", error);
    } finally {
        loading.value = false;
    }
}

const handleSearch = (searchTerm) => {
    queryParams.value.search = searchTerm;
    queryParams.value.page = 1;
    fetchData();
};

const handleSort = (sortData) => {
    queryParams.value.sort_field = sortData.field;
    queryParams.value.sort_order = sortData.order;
    fetchData();
};

const handlePageChange = (page) => {
    queryParams.value.page = page;
    fetchData();
};

const handlePerPageChange = (perPage) => {
    queryParams.value.per_page = perPage;
    queryParams.value.page = 1;
    fetchData();
};

const formatMoney = (value) => {
    if (!value) return '0 FBU';
    return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value);
};

onMounted(() => {
    fetchData();
})

const tableData = computed(() => store.state.data.remboursements_mensuels || {});

</script>