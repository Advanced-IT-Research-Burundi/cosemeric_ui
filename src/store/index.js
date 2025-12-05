import { createStore } from 'vuex'
import Dashboard from '../views/Dashboard.vue';

// Create a new store instance.
const vuexStore = createStore({
  state () {
    return {
      data: {
        cotisations: [],
        cotisationsMensuelles: [],
        members: [],
        categories: [],
        credits: [],
        mescredits: [],
        assistances: [],
        remboursements: [],
        periodes: [],
        Dashboard: [],
      },
      isLoading: false,
      error: null,
    activePage: null,

    }
  },
  mutations: {
    SET_LOADING(state, value) {
      state.isLoading = value;
    }
  },
  actions: {
    setLoading({ commit }, value) {
      commit('SET_LOADING', value);
    }
  }
 
})

export default vuexStore
