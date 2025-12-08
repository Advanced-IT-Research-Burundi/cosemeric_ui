<template>
  <div class="profile-container">
    <!-- Hero Section with Avatar -->
    <div class="profile-hero">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <div class="avatar">
              <span class="avatar-text">{{ getInitials }}</span>
            </div>
            <button class="avatar-edit-btn" @click="openAvatarUpload">
              <i class="bi bi-camera"></i>
            </button>
          </div>
          <div class="user-header-info">
            <h1 class="user-name">{{ fullName }}</h1>
            <div class="user-meta">
              <span class="badge" :class="getBadgeClass">
                <i class="bi bi-circle-fill"></i>
                {{ userData.statut || "Actif" }}
              </span>
              <span class="role-badge">
                <i class="bi bi-shield"></i>
                {{ userData.role }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="profile-main">
      <!-- Sidebar Stats -->
      <div class="profile-sidebar">
        <div class="stats-card">
          <h3 class="sidebar-title">
            <i class="bi bi-chart-line"></i>
            Statistiques
          </h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon blue">
                <i class="bi bi-calendar"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Membre depuis</span>
                <span class="stat-value">{{ memberSince }}</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon green">
                <i class="bi bi-id-card"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Matricule</span>
                <span class="stat-value">{{
                  userData.membre?.matricule || "N/A"
                }}</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon purple">
                <i class="bi bi-clock"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Dernière connexion</span>
                <span class="stat-value">{{ lastLogin }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-card">
          <h3 class="sidebar-title">
            <i class="bi bi-lightning-fill"></i>
            Actions rapides
          </h3>
          <div class="action-buttons">
            <button class="action-btn" @click="activeTab = 'info'">
              <i class="bi bi-pencil-square"></i>
              Modifier le profil
            </button>
            <button class="action-btn" @click="activeTab = 'password'">
              <i class="bi bi-shield-lock"></i>
              Changer le mot de passe
            </button>
            <button class="action-btn" @click="downloadProfile">
              <i class="bi bi-download"></i>
              Télécharger les infos
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="profile-content">
        <!-- Tabs Navigation -->
        <div class="modern-tabs">
          <button
            :class="['modern-tab', { active: activeTab === 'view' }]"
            @click="activeTab = 'view'"
          >
            <i class="bi bi-eye"></i>
            <span>Aperçu</span>
          </button>
          <button
            :class="['modern-tab', { active: activeTab === 'info' }]"
            @click="activeTab = 'info'"
          >
            <i class="bi bi-pencil-square"></i>
            <span>Modifier</span>
          </button>
          <button
            :class="['modern-tab', { active: activeTab === 'password' }]"
            @click="activeTab = 'password'"
          >
            <i class="bi bi-shield-lock"></i>
            <span>Sécurité</span>
          </button>
        </div>

        <!-- View Tab -->
        <div v-show="activeTab === 'view'" class="tab-panel">
          <div class="info-cards">
            <!-- Personal Information Card -->
            <div class="info-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="bi bi-person-circle"></i>
                  <h3>Informations personnelles</h3>
                </div>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item">
                    <label>
                      <i class="bi bi-person"></i>
                      Nom complet
                    </label>
                    <p>{{ fullName }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-envelope"></i>
                      Email
                    </label>
                    <p>{{ userData.email }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-telephone"></i>
                      Téléphone
                    </label>
                    <p>{{ userData.telephone || "Non renseigné" }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-gender-ambiguous"></i>
                      Sexe
                    </label>
                    <p>{{ getSexeLabel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Card -->
            <div class="info-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="bi bi-geo-alt"></i>
                  <h3>Adresse</h3>
                </div>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item full-width">
                    <label>
                      <i class="bi bi-house"></i>
                      Adresse complète
                    </label>
                    <p>{{ userData.adresse || "Non renseignée" }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-building"></i>
                      Ville
                    </label>
                    <p>{{ userData.ville || "Non renseignée" }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-flag"></i>
                      Pays
                    </label>
                    <p>{{ userData.pays || "Non renseigné" }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-mailbox"></i>
                      Code postal
                    </label>
                    <p>{{ userData.code_postal || "Non renseigné" }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Member Information Card -->
            <div class="info-card" v-if="userData.membre">
              <div class="card-header">
                <div class="card-title">
                  <i class="bi bi-person-badge"></i>
                  <h3>Informations membre</h3>
                </div>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item">
                    <label>
                      <i class="bi bi-hash"></i>
                      Matricule
                    </label>
                    <p class="highlight">{{ userData.membre.matricule }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-tag"></i>
                      Catégorie
                    </label>
                    <p>{{ userData.membre.categorie_id }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-calendar-check"></i>
                      Date d'adhésion
                    </label>
                    <p>{{ formatDate(userData.membre.date_adhesion) }}</p>
                  </div>
                  <div class="info-item">
                    <label>
                      <i class="bi bi-info-circle"></i>
                      Statut membre
                    </label>
                    <p>
                      <span
                        class="status-badge"
                        :class="userData.membre.statut"
                      >
                        {{ userData.membre.statut }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Tab -->
        <div v-show="activeTab === 'info'" class="tab-panel">
          <form @submit.prevent="updateProfile" class="modern-form">
            <div class="form-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="bi bi-pencil-square"></i>
                  <h3>Modifier vos informations</h3>
                </div>
              </div>
              <div class="card-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label>
                      <i class="bi bi-person"></i>
                      Nom <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="profileForm.nom"
                      class="modern-input"
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-person"></i>
                      Prénom <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="profileForm.prenom"
                      class="modern-input"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-envelope"></i>
                      Email <span class="required">*</span>
                    </label>
                    <input
                      type="email"
                      v-model="profileForm.email"
                      class="modern-input"
                      placeholder="votre.email@exemple.com"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-telephone"></i>
                      Téléphone <span class="required">*</span>
                    </label>
                    <input
                      type="tel"
                      v-model="profileForm.telephone"
                      class="modern-input"
                      placeholder="+257 79 XX XX XX"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-gender-ambiguous"></i>
                      Sexe
                    </label>
                    <select v-model="profileForm.sexe" class="modern-input">
                      <option value="">-- Sélectionner --</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>

                  <div class="form-group full-width">
                    <label>
                      <i class="bi bi-house"></i>
                      Adresse
                    </label>
                    <input
                      type="text"
                      v-model="profileForm.adresse"
                      class="modern-input"
                      placeholder="Rue, numéro, quartier..."
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-building"></i>
                      Ville
                    </label>
                    <input
                      type="text"
                      v-model="profileForm.ville"
                      class="modern-input"
                      placeholder="Votre ville"
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-flag"></i>
                      Pays
                    </label>
                    <input
                      type="text"
                      v-model="profileForm.pays"
                      class="modern-input"
                      placeholder="Votre pays"
                    />
                  </div>

                  <div class="form-group">
                    <label>
                      <i class="bi bi-mailbox"></i>
                      Code postal
                    </label>
                    <input
                      type="text"
                      v-model="profileForm.code_postal"
                      class="modern-input"
                      placeholder="Code postal"
                    />
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="activeTab = 'view'"
                >
                  <i class="bi bi-x-circle"></i>
                  Annuler
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  <i class="bi bi-check-circle"></i>
                  {{ isLoading ? "Enregistrement..." : "Enregistrer" }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Password Tab -->
        <div v-show="activeTab === 'password'" class="tab-panel">
          <form @submit.prevent="changePassword" class="modern-form">
            <div class="form-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="bi bi-shield-check"></i>
                  <h3>Sécurité du compte</h3>
                </div>
              </div>
              <div class="card-body">
                <div class="security-info">
                  <i class="bi bi-info-circle-fill"></i>
                  <div>
                    <strong>Conseil de sécurité :</strong>
                    <p>
                      Utilisez un mot de passe fort avec au moins 8 caractères,
                      incluant des majuscules, minuscules et chiffres.
                    </p>
                  </div>
                </div>

                <div class="form-grid password-grid">
                  <div class="form-group full-width">
                    <label>
                      <i class="bi bi-lock"></i>
                      Mot de passe actuel <span class="required">*</span>
                    </label>
                    <div class="password-field">
                      <input
                        :type="showCurrentPassword ? 'text' : 'password'"
                        v-model="passwordForm.current_password"
                        class="modern-input"
                        placeholder="Entrez votre mot de passe actuel"
                        required
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showCurrentPassword = !showCurrentPassword"
                      >
                        <i
                          class="bi"
                          :class="
                            showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'
                          "
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div class="form-group full-width">
                    <label>
                      <i class="bi bi-key"></i>
                      Nouveau mot de passe <span class="required">*</span>
                    </label>
                    <div class="password-field">
                      <input
                        :type="showNewPassword ? 'text' : 'password'"
                        v-model="passwordForm.new_password"
                        class="modern-input"
                        placeholder="Entrez votre nouveau mot de passe"
                        minlength="8"
                        required
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showNewPassword = !showNewPassword"
                      >
                        <i
                          class="bi"
                          :class="showNewPassword ? 'bi-eye-slash' : 'bi-eye'"
                        ></i>
                      </button>
                    </div>
                    <div
                      class="password-strength"
                      v-if="passwordForm.new_password"
                    >
                      <div class="strength-bar">
                        <div
                          class="strength-fill"
                          :class="passwordStrength.class"
                          :style="{ width: passwordStrength.width }"
                        ></div>
                      </div>
                      <span
                        class="strength-text"
                        :class="passwordStrength.class"
                      >
                        {{ passwordStrength.text }}
                      </span>
                    </div>
                  </div>

                  <div class="form-group full-width">
                    <label>
                      <i class="bi bi-shield-check"></i>
                      Confirmer le mot de passe <span class="required">*</span>
                    </label>
                    <div class="password-field">
                      <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="passwordForm.confirm_password"
                        class="modern-input"
                        placeholder="Confirmez votre nouveau mot de passe"
                        minlength="8"
                        required
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <i
                          class="bi"
                          :class="
                            showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'
                          "
                        ></i>
                      </button>
                    </div>
                    <span
                      v-if="passwordForm.confirm_password && !passwordsMatch"
                      class="error-message"
                    >
                      <i class="bi bi-x-circle"></i>
                      Les mots de passe ne correspondent pas
                    </span>
                    <span
                      v-if="passwordForm.confirm_password && passwordsMatch"
                      class="success-message"
                    >
                      <i class="bi bi-check-circle"></i>
                      Les mots de passe correspondent
                    </span>
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="resetPasswordForm"
                >
                  <i class="bi bi-arrow-clockwise"></i>
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading || !passwordsMatch"
                >
                  <i class="bi bi-shield-check"></i>
                  {{
                    isLoading ? "Modification..." : "Changer le mot de passe"
                  }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div
        v-if="notification.show"
        :class="['toast-notification', notification.type]"
      >
        <div class="toast-icon">
          <i
            class="bi"
            :class="
              notification.type === 'success'
                ? 'bi-check-circle-fill'
                : 'bi-exclamation-triangle-fill'
            "
          ></i>
        </div>
        <div class="toast-content">
          <strong>{{
            notification.type === "success" ? "Succès" : "Erreur"
          }}</strong>
          <p>{{ notification.message }}</p>
        </div>
        <button class="toast-close" @click="notification.show = false">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import api from "../../services/api";
import { computed, onMounted, ref } from "vue";

const store = useStore();
const activeTab = ref("view");
const isLoading = ref(false);

// Password visibility
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Notification
const notification = ref({
  show: false,
  type: "success",
  message: "",
});

// Forms
const profileForm = ref({
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  sexe: "",
  adresse: "",
  ville: "",
  pays: "",
  code_postal: "",
});

const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

// Computed
const currentUser = computed(() => store.state.user);

const userData = computed(() => {
  if (currentUser.value && currentUser.value.length > 0) {
    return currentUser.value[0];
  }
  return {};
});

const fullName = computed(() => {
  return (
    `${userData.value.prenom || ""} ${userData.value.nom || ""}`.trim() ||
    "Utilisateur"
  );
});

const getInitials = computed(() => {
  const nom = userData.value.nom || "";
  const prenom = userData.value.prenom || "";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "U";
});

const getBadgeClass = computed(() => {
  const statut = userData.value.statut?.toLowerCase();
  if (statut === "actif" || userData.value.is_active) return "badge-success";
  if (statut === "inactif") return "badge-warning";
  return "badge-secondary";
});

const getSexeLabel = computed(() => {
  if (userData.value.sexe === "M") return "Masculin";
  if (userData.value.sexe === "F") return "Féminin";
  return "Non renseigné";
});

const memberSince = computed(() => {
  if (userData.value.membre?.date_adhesion) {
    return formatDate(userData.value.membre.date_adhesion);
  }
  return "N/A";
});

const lastLogin = computed(() => {
  if (userData.value.last_login_at) {
    return formatDateTime(userData.value.last_login_at);
  }
  return "Jamais";
});

const passwordsMatch = computed(() => {
  if (
    !passwordForm.value.new_password ||
    !passwordForm.value.confirm_password
  ) {
    return true;
  }
  return (
    passwordForm.value.new_password === passwordForm.value.confirm_password
  );
});

const passwordStrength = computed(() => {
  const password = passwordForm.value.new_password;
  if (!password) return { class: "", width: "0%", text: "" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { class: "weak", width: "33%", text: "Faible" };
  if (strength <= 3) return { class: "medium", width: "66%", text: "Moyen" };
  return { class: "strong", width: "100%", text: "Fort" };
});

// Methods
const fetchProfile = async () => {
  try {
    const response = await api.get("/profiles");
    store.state.user = response.data;
    populateForm();
  } catch (error) {
    showNotification("error", "Erreur lors du chargement du profil");
    console.error(error);
  }
};

const populateForm = () => {
  if (userData.value) {
    profileForm.value = {
      nom: userData.value.nom || "",
      prenom: userData.value.prenom || "",
      email: userData.value.email || "",
      telephone: userData.value.telephone || "",
      sexe: userData.value.sexe || "",
      adresse: userData.value.adresse || "",
      ville: userData.value.ville || "",
      pays: userData.value.pays || "",
      code_postal: userData.value.code_postal || "",
    };
  }
};

const updateProfile = async () => {
  isLoading.value = true;
  try {
    const response = await api.put("/profiles", profileForm.value);
    store.state.user = [response.data];
    activeTab.value = "view";
    showNotification("success", "Profil mis à jour avec succès !");
  } catch (error) {
    const message =
      error.response?.data?.message || "Erreur lors de la mise à jour";
    showNotification("error", message);
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const changePassword = async () => {
  if (!passwordsMatch.value) {
    showNotification("error", "Les mots de passe ne correspondent pas");
    return;
  }

  isLoading.value = true;
  try {
    await api.post("/change-password", {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
      new_password_confirmation: passwordForm.value.confirm_password,
    });

    resetPasswordForm();
    showNotification("success", "Mot de passe modifié avec succès !");
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Erreur lors du changement de mot de passe";
    showNotification("error", message);
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const resetPasswordForm = () => {
  passwordForm.value = {
    current_password: "",
    new_password: "",
    confirm_password: "",
  };
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
};

const openAvatarUpload = () => {
  showNotification("info", "Fonctionnalité de téléchargement d'avatar à venir");
};

const downloadProfile = () => {
  const data = JSON.stringify(userData.value, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `profile-${userData.value.matricule || "data"}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const showNotification = (type, message) => {
  notification.value = { show: true, type, message };
  setTimeout(() => {
    notification.value.show = false;
  }, 4000);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
/* Importing Inter font for a modern feel */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

:root {
  /* Couleurs basées sur votre design CASOMIREC */
  --primary-color: #2563eb; /* Bleu principal de votre application */
  --primary-hover: #1e40af;
  --primary-light: #eff6ff;
  --primary-dark: #1e3a8a;

  --secondary-color: #10b981; /* Vert accent */
  --secondary-hover: #059669;

  --accent-purple: #8b5cf6;
  --accent-orange: #f59e0b;

  --bg-color: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;

  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

.profile-container {
  min-height: 100vh;
  background-color: var(--bg-color);
  padding-bottom: 3rem;
  font-family: "Inter", sans-serif;
}

/* Hero Section */
.profile-hero {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border-radius: 40px;
}

.hero-background::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.15), transparent);
}

.hero-content {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.avatar-section {
  display: flex;
  align-items: flex-end;
  gap: 2rem;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  border: 6px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}

.avatar-text {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--primary-color);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: var(--primary-color);
  font-size: 18px;
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
  background: var(--primary-color);
  color: white;
}

.user-header-info {
  padding-bottom: 1rem;
}

.user-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.badge-success {
  background: rgba(16, 185, 129, 0.25);
  color: #d1fae5;
  border: 2px solid rgba(16, 185, 129, 0.4);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.25);
  color: #fef3c7;
  border: 2px solid rgba(245, 158, 11, 0.4);
}

.badge .bi {
  font-size: 0.6rem;
}

.role-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Main Content */
.profile-main {
  max-width: 1400px;
  margin: 40px auto 0;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

/* Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-card,
.quick-actions-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-title i {
  color: var(--primary-color);
  font-size: 1.3rem;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-color);
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: white;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.action-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: var(--shadow-md);
}

.action-btn i {
  font-size: 1.1rem;
}

/* Content Area */
.profile-content {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

/* Modern Tabs */
.modern-tabs {
  display: flex;
  background: var(--bg-color);
  border-bottom: 3px solid var(--border-color);
}

.modern-tab {
  flex: 1;
  padding: 1.25rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
}

.modern-tab i {
  font-size: 1.2rem;
}

.modern-tab:hover {
  background: white;
  color: var(--text-primary);
}

.modern-tab.active {
  background: white;
  color: var(--primary-color);
}

.modern-tab.active::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--primary-hover)
  );
}

/* Tab Panel */
.tab-panel {
  padding: 2rem;
}

/* Info Cards */
.info-cards {
  display: grid;
  gap: 1.5rem;
}

.info-card {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.info-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--primary-light);
}

.card-header {
  background: linear-gradient(135deg, var(--bg-color) 0%, #e5e7eb 100%);
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.card-title i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.card-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.info-item label i {
  color: var(--primary-color);
}

.info-item p {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-primary);
  font-weight: 500;
}

.info-item .highlight {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.25rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.actif {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactif {
  background: #fef3c7;
  color: #92400e;
}

/* Modern Form */
.modern-form {
  max-width: 100%;
}

.form-card {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.password-grid {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group label i {
  color: var(--primary-color);
}

.required {
  color: var(--error);
}

.modern-input {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  background: var(--bg-color);
  font-family: inherit;
}

.modern-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.modern-input::placeholder {
  color: var(--text-muted);
}

/* Password Field */
.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
  border-radius: 6px;
}

.password-toggle:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 3px;
}

.strength-fill.weak {
  background: var(--error);
}

.strength-fill.medium {
  background: var(--warning);
}

.strength-fill.strong {
  background: var(--success);
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.strength-text.weak {
  color: var(--error);
}

.strength-text.medium {
  color: var(--warning);
}

.strength-text.strong {
  color: var(--success);
}

/* Messages */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.error-message {
  color: var(--error);
}

.success-message {
  color: var(--success);
}

/* Security Info */
.security-info {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #eff6ff;
  border-left: 4px solid var(--primary-color);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.security-info i {
  font-size: 1.5rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.security-info strong {
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.security-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Card Footer */
.card-footer {
  padding: 1.5rem;
  background: var(--bg-color);
  border-top: 2px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-hover) 100%
  );
  color: white;
  border: 2px solid transparent;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-color);
  border-color: var(--text-secondary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow-xl);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  z-index: 9999;
  border: 2px solid var(--border-color);
}

.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-notification.success .toast-icon {
  background: #d1fae5;
  color: var(--success);
}

.toast-notification.error .toast-icon {
  background: #fee2e2;
  color: var(--error);
}

.toast-icon i {
  font-size: 1.25rem;
}

.toast-content {
  flex: 1;
}

.toast-content strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.toast-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: var(--bg-color);
  color: var(--text-primary);
}

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .profile-main {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    order: 2;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    display: grid;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding-bottom: 2rem;
  }

  .profile-hero {
    height: 240px;
  }

  .hero-content {
    padding: 1rem;
  }

  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
  }

  .avatar {
    width: 120px;
    height: 120px;
  }

  .avatar-text {
    font-size: 2.5rem;
  }

  .user-name {
    font-size: 2rem;
  }

  .user-meta {
    justify-content: center;
    flex-wrap: wrap;
  }

  .profile-main {
    margin-top: -60px;
    padding: 0 1rem;
    gap: 1.5rem;
  }

  .tab-panel {
    padding: 1.5rem 1rem;
  }

  .form-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .modern-tab span {
    display: none;
  }

  .card-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .toast-notification {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }

  .profile-sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .user-name {
    font-size: 1.5rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-text {
    font-size: 2rem;
  }
}
</style>
