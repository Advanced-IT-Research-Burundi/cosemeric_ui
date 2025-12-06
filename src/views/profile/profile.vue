<template>  
<div>
  {{ currentUser }}
</div>
</template>

<script setup>
import { useStore } from 'vuex';
import api from '../../services/api';
import { computed, onMounted } from 'vue';
const store = useStore();

  onMounted(() => {
    fetchProfile();
  })

const fetchProfile = async () => {
    const response = await api.get('/profiles');
    store.state.user = response.data;
}

const currentUser = computed(() => store.state.user);


</script>