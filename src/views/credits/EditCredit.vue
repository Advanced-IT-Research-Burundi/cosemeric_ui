<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Modifier le Crédit #{{ creditId }}</h2>
      <router-link to="/credits" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left me-2"></i>Retour
      </router-link>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Chargement...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div v-if="submitError" class="alert alert-danger mb-4">
            {{ submitError }}
          </div>

          <div class="row g-3">
            <!-- Membre -->
            <div class="col-md-6">
              <label class="form-label"
                >Membre <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="formData.membre_id" required>
                <option v-for="m in members" :key="m.id" :value="m.id">
                  {{ m.prenom }} {{ m.nom }}
                </option>
              </select>
            </div>

            <!-- Montant Demandé -->
            <div class="col-md-6">
              <label class="form-label"
                >Montant Demandé <span class="text-danger">*</span></label
              >
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="formData.montant_demande"
                  min="0"
                  step="1"
                  required
                  @input="calculatePayments"
                />
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <!-- Montant Accordé -->
            <div class="col-md-6">
              <label class="form-label"
                >Montant Accordé <span class="text-danger">*</span></label
              >
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="formData.montant_accorde"
                  min="0"
                  step="1"
                  required
                  @input="calculatePayments"
                />
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <!-- Taux d'Intérêt -->
            <div class="col-md-6">
              <label class="form-label"
                >Taux d'Intérêt (%) <span class="text-danger">*</span></label
              >
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="formData.taux_interet"
                  min="0"
                  max="100"
                  step="1"
                  required
                  @input="calculatePayments"
                />
                <span class="input-group-text">%</span>
              </div>
            </div>

            <!-- Durée en Mois -->
            <div class="col-md-6">
              <label class="form-label"
                >Durée (mois) <span class="text-danger">*</span></label
              >
              <input
                type="number"
                class="form-control"
                v-model.number="formData.duree_mois"
                min="1"
                required
                @input="calculatePayments"
                disabled
              />
            </div>

            <!-- Montant Total à Rembourser -->
            <div class="col-md-6">
              <label class="form-label">Montant Total à Rembourser</label>
              <div class="form-control bg-light">
                {{ formData.montant_total_rembourser }} FBU
              </div>
            </div>

            <!-- Montant de la Mensualité -->
            <div class="col-md-6">
              <label class="form-label">Mensualité</label>
              <div class="form-control bg-light">
                {{ formData.montant_mensualite }} FBU
              </div>
            </div>

            <!-- Date de Demande -->
            <div class="col-md-6">
              <label class="form-label"
                >Date de Demande <span class="text-danger">*</span></label
              >
              <Datepicker
                v-model="formData.date_demande"
                :enable-time-picker="false"
                :auto-apply="true"
                required
              />
            </div>

            <!-- Date d'Approbation -->
            <div class="col-md-6">
              <label for="date_approbation" class="form-label"
                >Date d'Approbation</label
              >

              <Datepicker
                v-model="formData.date_approbation"
                :enable-time-picker="false"
                :auto-apply="true"
                :min-date="formData.date_demande"
                @input="calculateDateFin"
                @update:modelValue="calculateDateFin"
              />
            </div>

            <!-- Date de Fin -->
            <div class="col-md-6">
              <label for="date_fin" class="form-label">Date de Fin</label>

              <Datepicker
                v-model="formData.date_fin"
                :enable-time-picker="false"
                :auto-apply="true"
              />
            </div>

            <!-- Statut -->
            <div class="col-md-6">
              <label class="form-label"
                >Statut <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="formData.statut" required>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="rejete">Rejeté</option>
                <option value="rembourse">Remboursé</option>
              </select>
            </div>

            <!-- Motif -->
            <div class="col-12">
              <label class="form-label"
                >Motif du Crédit <span class="text-danger">*</span></label
              >
              <textarea
                class="form-control"
                v-model="formData.motif"
                rows="3"
                required
                placeholder="Décrivez la raison du crédit..."
              ></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="$router.push('/credits')"
              :disabled="saving"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "../../services/api";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const creditId = route.params.id;
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const submitError = ref("");
const members = ref([]);

const formData = ref({
  membre_id: "",
  montant_demande: 0,
  montant_accorde: 0,
  taux_interet: 0,
  duree_mois: 1,
  montant_total_rembourser: 0,
  montant_mensualite: 0,
  date_demande: new Date().toISOString().split("T")[0],
  date_approbation: "",
  date_fin: "",
  statut: "en_attente",
  motif: "",
});

// Fetch data
const fetchData = async () => {
  try {
    const [membersRes, creditRes] = await Promise.all([
      api.get("/membres"),
      api.get(`/credits/${creditId}`),
    ]);

    members.value = membersRes.data.data || [];

    const credit = creditRes.data;
    formData.value = {
      ...credit,
      date_demande: credit.date_demande
        ? credit.date_demande.split("T")[0]
        : "",
      date_approbation: credit.date_approbation
        ? credit.date_approbation.split("T")[0]
        : "",
    };

    console.log(formData.value);

    // Calculate initial payments
    calculatePayments();
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = "Erreur lors du chargement des données";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Calculate total amount and monthly payment
const calculatePayments = () => {
  const montant = parseFloat(formData.value.montant_accorde) || 0;
  const taux = parseFloat(formData.value.taux_interet) || 0;
  const duree = parseInt(formData.value.duree_mois) || 1;

  // Calculate total amount with interest
  const interet = (montant * taux * duree) / (12 * 100);
  const total = montant + interet;

  // Calculate monthly payment
  const mensualite = duree > 0 ? total / duree : 0;

  formData.value.montant_total_rembourser = total.toFixed(2);
  formData.value.montant_mensualite = mensualite.toFixed(2);
};

const calculateDateFin = () => {
  const dateFin = addMonths(
    formData.value.date_demande,
    formData.value.duree_mois
  );
  formData.value.date_fin = dateFin;
};

// Handle form submission
const handleSubmit = async () => {
  saving.value = true;
  submitError.value = "";

  try {
    const payload = { ...formData.value };
    await api.put(`/credits/${creditId}`, payload);
    toast.success("Crédit mis à jour avec succès");
    router.push("/credits");
  } catch (err) {
    console.error("Error updating credit:", err);
    submitError.value =
      err.response?.data?.message || "Erreur lors de la mise à jour";
    toast.error(submitError.value);
  } finally {
    saving.value = false;
  }
};

// Initialize component
onMounted(fetchData);
</script>
