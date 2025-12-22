<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h2 class="h4 mb-0">Ajouter un nouveau membre</h2>
          </div>
          <div class="card-body">
            <!-- Message d'erreur -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="submitForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="matricule" class="form-label">Matricule</label>
                  <input
                    type="text"
                    class="form-control"
                    id="matricule"
                    v-model="form.matricule"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label for="categorie" class="form-label">Catégorie</label>
                  <select
                    class="form-select"
                    id="categorie"
                    v-model="form.categorie_id"
                    required
                  >
                    <option value="" disabled>
                      Sélectionnez une catégorie
                    </option>
                    <option
                      v-for="categorie in categories"
                      :key="categorie.id"
                      :value="categorie.id"
                    >
                      {{ categorie.nom }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label for="nom" class="form-label">Nom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="nom"
                    v-model="form.nom"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label for="prenom" class="form-label">Prénom</label>
                  <input
                    type="text"
                    class="form-control"
                    id="prenom"
                    v-model="form.prenom"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="form.email"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label for="telephone" class="form-label">Téléphone</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="telephone"
                    v-model="form.telephone"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label for="statut" class="form-label">Statut</label>
                  <select
                    class="form-select"
                    id="statut"
                    v-model="form.statut"
                    required
                  >
                    <option value="" disabled>Sélectionnez un statut</option>
                    <option
                      v-for="statut in statuts"
                      :key="statut"
                      :value="statut"
                    >
                      {{ statut }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label for="date_adhesion" class="form-label"
                    >Date d'adhésion</label
                  >

                  <Datepicker
                    v-model="form.date_adhesion"
                    :enable-time-picker="false"
                    :auto-apply="true"
                  />
                </div>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                <button
                  type="button"
                  class="btn btn-outline-secondary me-md-2"
                  @click="$router.go(-1)"
                >
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import api from "../../services/api";

const form = ref({
  matricule: "",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  categorie_id: "",
  statut: "",
  date_adhesion: new Date().toISOString().split("T")[0],
});

const store = useStore();
const router = useRouter();
const errorMessage = ref("");

const statuts = ref(["actif", "inactif", "suspendu"]);

onMounted(() => {
  loadCategories();
});

async function loadCategories() {
  try {
    const response = await api.get("/categorie-membres");
    store.state.categories = response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
    errorMessage.value =
      "Erreur lors du chargement des catégories. Veuillez rafraîchir la page.";
  }
}

async function submitForm() {
  errorMessage.value = "";
  try {
    await api.post("/membres", form.value);
    router.push("/members");
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    errorMessage.value = error.response.data.message;
  }
}

const categories = computed(() => store.state.categories || []);
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.form-label {
  font-weight: 500;
}

.btn {
  min-width: 120px;
}
</style>
