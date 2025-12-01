<<template>
  <div class="profile-card-wrapper">
    <div class="profile-card">
      <h2 class="card-title">Mon Profil Utilisateur</h2>

      <div v-if="user" class="card-content">
        
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <template v-if="user.avatar">
              <img :src="user.avatar" :alt="user.name" class="avatar-img" />
            </template>
            <template v-else>
              <div class="user-initials">{{ userInitials }}</div>
            </template>
          </div>
          <h3 class="user-name">{{ user.name }}</h3>
          <p class="user-role">{{ user.role }}</p>
        </div>
        
        <hr class="separator" />

        <div class="details-section">
          <div class="detail-item">
            <span class="detail-label"><i class="fas fa-envelope detail-icon"></i>Email :</span>
            <span class="detail-value">{{ user.email }}</span>
          </div>
          
          <div class="detail-item" v-if="user.phone">
            <span class="detail-label"><i class="fas fa-phone detail-icon"></i>Téléphone :</span>
            <span class="detail-value">{{ user.phone }}</span>
          </div>

          <div class="detail-item" v-if="user.last_login">
            <span class="detail-label"><i class="fas fa-history detail-icon"></i>Dernière connexion :</span>
            <span class="detail-value">{{ user.last_login }}</span>
          </div>
        </div>

      </div>
      
      <div v-else class="card-loading">
        <p><i class="fas fa-spinner fa-spin me-2"></i>Chargement du profil...</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";
// Assurez-vous d'avoir Font Awesome installé ou importé pour les icônes (fas)
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const userInitials = computed(() => {
  if (!user.value || !user.value.name) return "";
  const name = user.value.name;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2); // Limite à deux initiales
});
</script>

<style scoped>
/* Conteneur principal */
.profile-card-wrapper {
  padding: 2rem;
  background-color: #f8f9fa; /* Arrière-plan légèrement gris */
  min-height: 100vh;
}

/* Carte principale (amélioration de .profile-container) */
.profile-card {
  max-width: 450px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Ombre plus douce */
  padding: 0; /* On retire le padding du conteneur principal */
  overflow: hidden;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #343a40;
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0;
}

.card-content {
  padding: 1.5rem;
}

/* --- Section Avatar et Nom --- */

.avatar-section {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.avatar-wrapper {
  display: inline-block;
  margin-bottom: 0.75rem;
}

.avatar-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #3d24ab; /* Bordure colorée */
  transition: transform 0.3s ease;
}

.avatar-img:hover {
  transform: scale(1.05);
}

.user-initials {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #3c19d7; /* Couleur primaire pour l'arrière-plan */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000; /* Texte blanc */
  font-weight: 700;
  font-size: 2.2rem;
  border: 4px solid #cfe2ff; /* Bordure secondaire claire */
}

.user-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.1rem;
}

.user-role {
  font-size: 1rem;
  color: #6c757d;
  font-style: italic;
  margin-bottom: 0;
}

/* --- Section Détails --- */

.separator {
  border: 0;
  border-top: 1px dashed #ced4da; /* Séparateur discret */
  margin: 1.5rem 0;
}

.details-section {
  padding-top: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa; /* Ligne de séparation très fine */
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
}

.detail-icon {
  color: #b4b4b4; /* Couleur de l'icône */
  margin-right: 0.5rem;
  width: 1rem; /* Assure un alignement parfait */
  text-align: center;
}

.detail-value {
  color: #212529;
  font-weight: 400;
}

/* --- Chargement --- */

.card-loading {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
</style>