import { createStore } from 'vuex'

// Create a new store instance.
const vuexStore = createStore({
  state () {
    return {
      cotisations: [],
      members: [],
      categories: [],
      credits: [],
    }
  },
 
})

export default vuexStore
