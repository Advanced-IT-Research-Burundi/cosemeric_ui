<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Modifier la Cotisation #{{ contributionId }}</h2>
      <router-link to="/contributions" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour à la liste
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
    </div>

    <div v-else class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <!-- Membre -->
            <div class="col-md-6">
              <label for="membre_id" class="form-label"
                >Membre <span class="text-danger">*</span></label
              >
              <select
                id="membre_id"
                class="form-select"
                v-model="formData.membre_id"
                required
                :disabled="loadingMembers"
              >
                <option value="" disabled>Sélectionnez un membre</option>
                <option
                  v-for="membre in members"
                  :key="membre.id"
                  :value="membre.id"
                  :selected="membre.id === formData.membre_id"
                >
                  {{ membre.prenom }} {{ membre.nom }}
                </option>
              </select>
            </div>

            <!-- Montant et Devise -->
            <div class="col-md-6">
              <label for="montant" class="form-label"
                >Montant <span class="text-danger">*</span></label
              >
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  id="montant"
                  v-model.number="formData.montant"
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  class="form-select"
                  style="max-width: 100px"
                  v-model="formData.devise"
                  required
                >
                  <option value="FBU">FBU</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <!-- Date de Paiement -->
            <div class="col-md-6">
              <label for="date_paiement" class="form-label"
                >Date de Paiement <span class="text-danger">*</span></label
              >

              <Datepicker
                v-model="formData.date_paiement"
                :enable-time-picker="false"
                :auto-apply="true"
              />
            </div>

            <!-- Mode de Paiement -->
            <div class="col-md-6">
              <label for="mode_paiement" class="form-label"
                >Mode de Paiement <span class="text-danger">*</span></label
              >
              <select
                id="mode_paiement"
                class="form-select"
                v-model="formData.mode_paiement"
                required
              >
                <option value="1">Espèces</option>
                <option value="2">Virement</option>
                <option value="3">Chèque</option>
                <option value="4">Mobile Money</option>
              </select>
            </div>

            <!-- Référence de Paiement -->
            <div class="col-md-6">
              <label for="reference_paiement" class="form-label"
                >Référence de Paiement</label
              >
              <input
                type="string"
                class="form-control"
                id="reference_paiement"
                v-model="formData.reference_paiement"
                placeholder="Numéro de référence ou de transaction"
              />
            </div>

            <!-- Statut -->
            <!-- Statut -->
            <div class="col-12">
              <label for="statut" class="form-label"
                >Statut <span class="text-danger">*</span></label
              >
              <div class="d-flex gap-4">
                <div class="form-radio">
                  <input
                    type="radio"
                    name="statut"
                    class="form-check-input"
                    id="paye"
                    v-model="formData.statut"
                    value="paye"
                  />
                  <label for="paye" class="form-check-label ps-1">Payé</label>
                </div>
                <div class="form-radio">
                  <input
                    type="radio"
                    name="statut"
                    class="form-check-input"
                    id="en_attente"
                    v-model="formData.statut"
                    value="en_attente"
                  />
                  <label for="en_attente" class="form-check-label ps-1"
                    >En attente</label
                  >
                </div>

                <div class="form-radio">
                  <input
                    type="radio"
                    name="statut"
                    class="form-check-input"
                    id="en_retard"
                    v-model="formData.statut"
                    value="en_retard"
                  />
                  <label for="en_retard" class="form-check-label ps-1"
                    >En retard</label
                  >
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="col-12">
              <label for="notes" class="form-label">Notes</label>
              <textarea
                class="form-control"
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Notes supplémentaires..."
              ></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="$router.push('/contributions')"
              :disabled="saving"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving || loadingMembers"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ saving ? "Enregistrement..." : "Mettre à jour" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import api from "../../services/api";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const saving = ref(false);
const loadingMembers = ref(true);
const error = ref("");

const members = ref([]);
const contributionId = route.params.id;

const formData = ref({
  membre_id: "",
  montant: 0,
  devise: null,
  date_paiement: null,
  mode_paiement: null,
  reference_paiement: "",
  statut: null,
  notes: "",
});

// Fetch members
const fetchMembers = async () => {
  try {
    const response = await api.get("/membres?per_page=1000");
    members.value = response.data.data || [];
  } catch (err) {
    console.error("Error fetching members:", err);
  } finally {
    loadingMembers.value = false;
  }
};

// Fetch contribution data
const fetchContribution = async () => {
  try {
    const response = await api.get(`/cotisations/${contributionId}`);
    const data = response.data;
    // Map API data to form data
    let formattedDate = null;
    if (data.date_paiement) {
      const date = new Date(data.date_paiement);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split("T")[0];
      }
    }

    formData.value = {
      ...data,
      date_paiement: formattedDate,
    };
    console.log(formData.value);
  } catch (err) {
    console.error("Error fetching contribution:", err);
    error.value = "Erreur lors du chargement de la cotisation";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

// Handle form submission
const handleSubmit = async () => {
  saving.value = true;
  error.value = "";

  try {
    // Prepare the data for API
    const payload = formData.value;

    const response = await api.put(`/cotisations/${contributionId}`, payload);

    if (response.data) {
      toast.success("Cotisation mise à jour avec succès");
      router.push("/contributions");
    } else {
      throw new Error("Réponse inattendue du serveur");
    }
  } catch (err) {
    console.error("Error updating contribution:", err);
    error.value =
      err.response?.data?.message ||
      "Erreur lors de la mise à jour de la cotisation";
    toast.error(error.value);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchMembers();
  fetchContribution();
});
</script>
