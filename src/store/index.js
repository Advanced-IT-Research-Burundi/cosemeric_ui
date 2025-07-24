import { createStore } from 'vuex'

// Create a new store instance.
const vuexStore = createStore({
  state () {
    return {
      data: {
        cotisations: [],
        members: [],
        categories: [],
        credits: [],
      },
      isLoading: false,
      error: null,

    }
  },
 
})

export default vuexStore
