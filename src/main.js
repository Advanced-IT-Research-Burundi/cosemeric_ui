import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'vue-toastification/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import vuexStore from './store'
import $ from 'jquery'
import 'select2'
import 'select2/dist/css/select2.css'
// Create app
const app = createApp(App)

// Add plugins
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(vuexStore)
app.use(router)

// Configure toast notifications
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(Toast, toastOptions)

// Mount the app
app.mount('#app')

$(document).ready(function() {
    $(".select2").select2();
})