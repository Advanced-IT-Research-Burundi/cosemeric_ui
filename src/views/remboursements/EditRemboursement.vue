<template>
  <div class="container py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Modifier le Remboursement #{{ remboursementId }}</h2>
      <router-link to="/remboursements" class="btn btn-outline-secondary">
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
            <div class="col-12">
              <div
                class="alert alert-info d-flex align-items-center"
                role="alert"
              >
                <i class="fas fa-file-invoice-dollar me-2"></i>
                <div>
                  Crédit sélectionné : <strong>#{{ form.credit_id }}</strong>
                  <template v-if="selectedCredit">
                    &nbsp;pour
                    {{
                      selectedCredit.membre?.nom +
                      " " +
                      selectedCredit.membre?.prenom
                    }}
                    | Montant:
                    {{
                      selectedCredit.montant_accorde ||
                      selectedCredit.montant ||
                      0
                    }}
                  </template>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label"
                >N° échéance <span class="text-danger">*</span></label
              >
              <input
                type="number"
                class="form-control"
                v-model.number="form.numero_echeance"
                min="1"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label"
                >Montant prévu <span class="text-danger">*</span></label
              >
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="form.montant_prevu"
                  min="0"
                  step="1"
                  required
                />
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Montant payé</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="form.montant_paye"
                  min="0"
                  step="1"
                />
                <span class="input-group-text">FBU</span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label"
                >Date d'échéance <span class="text-danger">*</span></label
              >
              <Datepicker
                v-model="form.date_echeance"
                :enable-time-picker="false"
                :auto-apply="true"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">Date de paiement</label>
              <Datepicker
                v-model="form.date_paiement"
                :enable-time-picker="false"
                :auto-apply="true"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label"
                >Statut <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="form.statut" required>
                <option value="prevu">Prevu</option>
                <option value="paye">Payé</option>
                <option value="en_retard">En retard</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Pénalité</label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="form.penalite"
                  min="0"
                  step="1"
                />
                <span class="input-group-text">FBU</span>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="saving"
              @click="$router.push('/remboursements')"
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
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "../../services/api";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const remboursementId = route.params.id;
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const submitError = ref("");
const credits = ref([]);

const toDateInput = (v) => (v ? v.split("T")[0] : "");

const form = ref({
  credit_id: "",
  numero_echeance: 1,
  montant_prevu: 0,
  montant_paye: 0,
  date_echeance: "",
  date_paiement: "",
  penalite: 0,
});

const selectedCredit = computed(() => {
  const credit = credits.value.find((c) => c.id === form.value.credit_id);
  return credit;
});

const fetchData = async () => {
  try {
    const [creditsRes, rembRes] = await Promise.all([
      api.get("/credits"),
      api.get(`/remboursements/${remboursementId}`),
    ]);
    credits.value = Array.isArray(creditsRes.data)
      ? creditsRes.data
      : creditsRes.data?.data || creditsRes.data || [];
    const r = rembRes.data;
    const data = Array.isArray(r) ? r[0] : r;
    form.value = {
      ...form.value,
      credit_id: data.credit_id,
      ...data,
      date_echeance: toDateInput(data?.date_echeance),
      date_paiement: toDateInput(data?.date_paiement),
    };
  } catch (e) {
    console.error("Error fetching remboursement", e);
    error.value = "Erreur lors du chargement des données";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  saving.value = true;
  submitError.value = "";
  try {
    const payload = { ...form.value };
    payload.numero_echeance = Number(payload.numero_echeance);
    payload.montant_prevu = Number(payload.montant_prevu);
    payload.montant_paye = Number(payload.montant_paye || 0);
    payload.penalite = Number(payload.penalite || 0);
    await api.put(`/remboursements/${remboursementId}`, payload);
    toast.success("Remboursement mis à jour avec succès");
    router.push("/remboursements");
  } catch (e) {
    console.error("Error updating remboursement", e);
    submitError.value =
      e?.response?.data?.message || "Erreur lors de la mise à jour";
    toast.error(submitError.value);
  } finally {
    saving.value = false;
  }
};

onMounted(fetchData);
</script>
