<template>
  <div class="container py-5">
    <div class="text-center mb-5 animate-fade-in">
      <h1 class="display-5 fw-bold text-dark mb-3 hero-title">
        Centre de Configuration
      </h1>
      <p class="lead text-muted mx-auto subtitle" style="max-width: 700px">
        Gérez les paramètres fondamentaux de votre organisation, les catégories
        de membres et les types d'assistance à partir d'un seul endroit.
      </p>
    </div>

    <div class="row g-4 justify-content-center">
      <!-- Card 1: General Config -->
      <div class="col-md-4 col-lg-3">
        <router-link
          :to="{ name: 'configGenerale' }"
          class="text-decoration-none h-100 d-block"
        >
          <div class="card h-100 shadow-sm border-0 config-card transition-all">
            <div
              class="card-body p-4 text-center d-flex flex-column justify-content-between"
            >
              <div>
                <div
                  class="icon-wrapper mb-4 bg-primary bg-opacity-10 text-primary mx-auto"
                >
                  <i class="bi bi-sliders2 fs-1"></i>
                </div>
                <h3 class="card-title h5 fw-bold mb-3">Paramètres Généraux</h3>
                <p class="card-text text-muted small mb-4">
                  Configurez les clés/valeurs globales comme les taux d'intérêt,
                  les noms d'organisation, etc.
                </p>
              </div>
              <div class="btn btn-primary w-100 py-2 rounded-pill fw-bold">
                Gérer
                <i class="bi bi-arrow-right ms-2 transition-all arrow"></i>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Card 2: Categories -->
      <div class="col-md-4 col-lg-3">
        <router-link
          :to="{ name: 'configCategories' }"
          class="text-decoration-none h-100 d-block"
        >
          <div class="card h-100 shadow-sm border-0 config-card transition-all">
            <div
              class="card-body p-4 text-center d-flex flex-column justify-content-between"
            >
              <div>
                <div
                  class="icon-wrapper mb-4 bg-success bg-opacity-10 text-success mx-auto"
                >
                  <i class="bi bi-people-fill fs-1"></i>
                </div>
                <h3 class="card-title h5 fw-bold mb-3">Catégories Membres</h3>
                <p class="card-text text-muted small mb-4">
                  Définissez les différentes catégories de membres, leurs
                  cotisations et fréquences de paiement.
                </p>
              </div>
              <div class="btn btn-success w-100 py-2 rounded-pill fw-bold">
                Gérer
                <i class="bi bi-arrow-right ms-2 transition-all arrow"></i>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Card 3: Assistances -->
      <div class="col-md-4 col-lg-3">
        <router-link
          :to="{ name: 'configAssistances' }"
          class="text-decoration-none h-100 d-block"
        >
          <div class="card h-100 shadow-sm border-0 config-card transition-all">
            <div
              class="card-body p-4 text-center d-flex flex-column justify-content-between"
            >
              <div>
                <div
                  class="icon-wrapper mb-4 bg-info bg-opacity-10 text-info mx-auto"
                >
                  <i class="bi bi-heart-pulse-fill fs-1"></i>
                </div>
                <h3 class="card-title h5 fw-bold mb-3">Types Assistances</h3>
                <p class="card-text text-muted small mb-4">
                  Gérez les types d'assistance sociale, leurs montants standard
                  et les conditions requises.
                </p>
              </div>
              <div
                class="btn btn-info w-100 py-2 rounded-pill fw-bold text-white"
              >
                Gérer
                <i class="bi bi-arrow-right ms-2 transition-all arrow"></i>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No specific logic needed
</script>

<style scoped>
.config-card {
  border-radius: 24px;
  background: #ffffff;
  transition:
    transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.4s ease;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
}

.config-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  transition: all 0.4s ease;
}

.config-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.config-card:hover .arrow {
  transform: translateX(5px);
}

.transition-all {
  transition: all 0.3s ease;
}

.hero-title {
  background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.subtitle {
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
