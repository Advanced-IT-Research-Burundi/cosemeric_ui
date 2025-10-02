<template>
  <div class="dashboard-container">
    <!-- Navbar -->
   

    <div class="container-fluid px-4">
      <!-- Cartes de statistiques principales -->
      <div class="row g-4 mb-4">
        <!-- Total Cotisations Mensuelles -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-primary-gradient">
                <i class="bi bi-wallet2"></i>
              </div>
              <div class="stat-value text-primary">{{ formatMontant(stats.cotisationsMois) }}</div>
              <div class="stat-label">Cotisations ce mois</div>
              <div class="stat-change text-success">
                <i class="bi bi-arrow-up"></i> +{{ stats.evolutionCotisations }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Total Cotisations Cumulatif -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-info-gradient">
                <i class="bi bi-piggy-bank"></i>
              </div>
              <div class="stat-value text-info">{{ formatMontant(stats.cotisationsCumulatif) }}</div>
              <div class="stat-label">Cotisations cumulées</div>
              <div class="stat-change text-muted">
                Total depuis début
              </div>
            </div>
          </div>
        </div>

        <!-- Membres Actifs -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-success-gradient">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="stat-value text-success">{{ stats.membresActifs }}</div>
              <div class="stat-label">Membres Actifs</div>
              <div class="stat-change text-danger">
                <i class="bi bi-person-x"></i> {{ stats.membresInactifs }} inactifs
              </div>
            </div>
          </div>
        </div>

        <!-- Crédits Accordés -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-warning-gradient">
                <i class="bi bi-credit-card"></i>
              </div>
              <div class="stat-value text-warning">{{ formatMontant(stats.creditsTotal) }}</div>
              <div class="stat-label">Crédits Accordés</div>
              <div class="stat-change text-warning">
                <i class="bi bi-hourglass-split"></i> {{ stats.creditsEnCours }} en cours
              </div>
            </div>
          </div>
        </div>

        <!-- Dettes en Attente -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-danger-gradient">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div class="stat-value text-danger">{{ formatMontant(stats.dettesAttente) }}</div>
              <div class="stat-label">Dettes en Attente</div>
              <div class="stat-change text-danger">
                <i class="bi bi-bell-fill"></i> Action requise
              </div>
            </div>
          </div>
        </div>

        <!-- Demandes d'Assistance -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-purple-gradient">
                <i class="bi bi-hand-thumbs-up-fill"></i>
              </div>
              <div class="stat-value text-purple">{{ stats.demandesAssistance }}</div>
              <div class="stat-label">Demandes Assistance</div>
              <div class="stat-change text-success">
                <i class="bi bi-check-circle"></i> {{ stats.aidesAccordees }} accordées
              </div>
            </div>
          </div>
        </div>

        <!-- Taux de Recouvrement -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-teal-gradient">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div class="stat-value text-teal">{{ stats.tauxRecouvrement }}%</div>
              <div class="stat-label">Taux Recouvrement</div>
              <div class="stat-change text-success">
                <i class="bi bi-star-fill"></i> Excellent
              </div>
            </div>
          </div>
        </div>

        <!-- Solde Disponible -->
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card stat-card">
            <div class="card-body">
              <div class="stat-icon bg-dark-gradient">
                <i class="bi bi-bank2"></i>
              </div>
              <div class="stat-value text-dark">{{ formatMontant(stats.soldeDisponible) }}</div>
              <div class="stat-label">Solde Disponible</div>
              <div class="stat-change text-info">
                <i class="bi bi-shield-check"></i> Sécurisé
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Graphiques -->
      <h2 class="section-title">
        <i class="bi bi-bar-chart-line-fill me-2"></i>
        Analyses et Tendances
      </h2>

      <div class="row g-4 mb-4">
        <!-- Graphique Cotisations Mensuelles -->
        <div class="col-12 col-lg-8">
          <div class="card chart-card">
            <div class="card-header">
              <i class="bi bi-graph-up me-2"></i>
              Évolution des Cotisations Mensuelles
            </div>
            <div class="card-body">
              <canvas ref="cotisationsChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Graphique Répartition Membres -->
        <div class="col-12 col-lg-4">
          <div class="card chart-card">
            <div class="card-header">
              <i class="bi bi-pie-chart-fill me-2"></i>
              Répartition des Membres
            </div>
            <div class="card-body d-flex align-items-center justify-content-center">
              <canvas ref="membresChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Graphique Crédits vs Remboursements -->
        <div class="col-12 col-lg-6">
          <div class="card chart-card">
            <div class="card-header">
              <i class="bi bi-cash-stack me-2"></i>
              Crédits vs Remboursements (6 derniers mois)
            </div>
            <div class="card-body">
              <canvas ref="creditsChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Graphique Assistances par Type -->
        <div class="col-12 col-lg-6">
          <div class="card chart-card">
            <div class="card-header">
              <i class="bi bi-heart-pulse-fill me-2"></i>
              Assistances par Type
            </div>
            <div class="card-body">
              <canvas ref="assistancesChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Graphique Tendance Mensuelle -->
        <div class="col-12">
          <div class="card chart-card">
            <div class="card-header">
              <i class="bi bi-calendar3 me-2"></i>
              Vue d'ensemble - Cotisations et Dépenses (12 derniers mois)
            </div>
            <div class="card-body">
              <canvas ref="tendanceChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Chart from 'chart.js/auto';

// ============================================
// DONNÉES RÉACTIVES DU DASHBOARD
// ============================================
const stats = ref({
  cotisationsMois: 295000,          // Cotisations du mois en cours
  cotisationsCumulatif: 3480000,     // Total cumulé depuis le début
  evolutionCotisations: 12,          // Pourcentage d'évolution
  membresActifs: 156,                // Nombre de membres actifs
  membresInactifs: 24,               // Nombre de membres inactifs
  creditsTotal: 1850000,             // Total des crédits accordés
  creditsEnCours: 12,                // Nombre de crédits en cours
  dettesAttente: 320000,             // Montant des dettes en attente
  demandesAssistance: 38,            // Nombre de demandes reçues
  aidesAccordees: 32,                // Nombre d'aides accordées
  tauxRecouvrement: 92,              // Pourcentage de recouvrement
  soldeDisponible: 1310000           // Solde disponible en caisse
});

// ============================================
// COMPUTED - DATE ACTUELLE FORMATÉE
// ============================================


// ============================================
// FONCTION DE FORMATAGE DES MONTANTS
// ============================================
const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'BIF',
    minimumFractionDigits: 0
  }).format(montant);
};

// ============================================
// RÉFÉRENCES POUR LES CANVAS DES GRAPHIQUES
// ============================================
const cotisationsChart = ref(null);
const membresChart = ref(null);
const creditsChart = ref(null);
const assistancesChart = ref(null);
const tendanceChart = ref(null);

// ============================================
// INITIALISATION DES GRAPHIQUES
// ============================================
const initCharts = () => {
  // Configuration commune pour tous les graphiques
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }
        }
      }
    }
  };

  // 1. GRAPHIQUE: Évolution des Cotisations Mensuelles (Courbe)
  if (cotisationsChart.value) {
    new Chart(cotisationsChart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'],
        datasets: [{
          label: 'Cotisations (BIF)',
          data: [180000, 195000, 210000, 225000, 240000, 255000, 270000, 285000, 295000],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#2980b9',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('fr-FR') + ' BIF';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // 2. GRAPHIQUE: Répartition Membres (Camembert)
  if (membresChart.value) {
    new Chart(membresChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Membres Actifs', 'Membres Inactifs'],
        datasets: [{
          data: [156, 24],
          backgroundColor: ['#27ae60', '#e74c3c'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 10
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // 3. GRAPHIQUE: Crédits vs Remboursements (Barres groupées)
  if (creditsChart.value) {
    new Chart(creditsChart.value, {
      type: 'bar',
      data: {
        labels: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'],
        datasets: [
          {
            label: 'Crédits accordés',
            data: [250000, 320000, 280000, 350000, 310000, 340000],
            backgroundColor: '#f39c12',
            borderRadius: 5,
            borderWidth: 0
          },
          {
            label: 'Remboursements',
            data: [180000, 220000, 250000, 280000, 290000, 310000],
            backgroundColor: '#27ae60',
            borderRadius: 5,
            borderWidth: 0
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('fr-FR') + ' BIF';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // 4. GRAPHIQUE: Assistances par Type (Barres horizontales)
  if (assistancesChart.value) {
    new Chart(assistancesChart.value, {
      type: 'bar',
      data: {
        labels: ['Santé', 'Éducation', 'Urgence', 'Funérailles', 'Autres'],
        datasets: [{
          label: 'Nombre d\'assistances',
          data: [12, 8, 5, 4, 9],
          backgroundColor: ['#e74c3c', '#3498db', '#f39c12', '#95a5a6', '#9b59b6'],
          borderRadius: 5,
          borderWidth: 0
        }]
      },
      options: {
        ...commonOptions,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // 5. GRAPHIQUE: Tendance Mensuelle (Courbe multiple)
  if (tendanceChart.value) {
    new Chart(tendanceChart.value, {
      type: 'line',
      data: {
        labels: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'],
        datasets: [
          {
            label: 'Cotisations',
            data: [150000, 165000, 175000, 180000, 195000, 210000, 225000, 240000, 255000, 270000, 285000, 295000],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4
          },
          {
            label: 'Crédits',
            data: [200000, 220000, 240000, 250000, 320000, 280000, 350000, 310000, 340000, 330000, 350000, 360000],
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4
          },
          {
            label: 'Assistances',
            data: [50000, 55000, 60000, 65000, 70000, 75000, 72000, 78000, 80000, 82000, 85000, 88000],
            borderColor: '#9b59b6',
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('fr-FR') + ' BIF';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
};

// ============================================
// LIFECYCLE HOOK - AU MONTAGE DU COMPOSANT
// ============================================
onMounted(() => {
  // Initialiser tous les graphiques après le rendu du DOM
  setTimeout(() => {
    initCharts();
  }, 100);
});
</script>

<style scoped>
/* ============================================
   VARIABLES CSS
   ============================================ */
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --info-color: #3498db;
  --purple-color: #9b59b6;
  --teal-color: #1abc9c;
  --light-bg: #f8f9fa;
}

/* ============================================
   CONTENEUR PRINCIPAL
   ============================================ */
.dashboard-container {
  background-color: var(--light-bg);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ============================================
   NAVBAR PERSONNALISÉE
   ============================================ */
.custom-navbar {
  background: rgb(174, 204, 234);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.navbar-brand {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ============================================
   CARTES DE STATISTIQUES
   ============================================ */
.stat-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.stat-card .card-body {
  padding: 0;
}

/* ============================================
   ICÔNES DES STATISTIQUES
   ============================================ */
.stat-icon {
  width: 65px;
  height: 65px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.2rem;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* Gradients pour les icônes */
.bg-primary-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-success-gradient {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.bg-warning-gradient {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.bg-danger-gradient {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.bg-info-gradient {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.bg-purple-gradient {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.bg-teal-gradient {
  background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
}

.bg-dark-gradient {
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
}

/* ============================================
   VALEURS ET LABELS DES STATISTIQUES
   ============================================ */
.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 0.8rem;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Couleurs personnalisées */
.text-purple {
  color: var(--purple-color);
}

.text-teal {
  color: var(--teal-color);
}

/* ============================================
   CARTES DE GRAPHIQUES
   ============================================ */
.chart-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-card .card-header {
  background-color: white;
  border-bottom: 3px solid #e9ecef;
  font-weight: 600;
  color: var(--primary-color);
  padding: 1.3rem 1.5rem;
  font-size: 1.05rem;
}

.chart-card .card-body {
  padding: 1.5rem;
  background-color: white;
}

/* ============================================
   TITRE DE SECTION
   ============================================ */
.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 2.5rem 0 1.5rem 0;
  padding-bottom: 0.8rem;
  border-bottom: 4px solid var(--secondary-color);
  display: flex;
  align-items: center;
}

/* ============================================
   RESPONSIVE - MOBILE
   ============================================ */
@media (max-width: 768px) {
  .stat-value {
    font-size: 1.7rem;
  }
  
  .stat-icon {
    width: 55px;
    height: 55px;
    font-size: 1.6rem;
  }

  .navbar-brand {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .chart-card .card-header {
    font-size: 0.95rem;
    padding: 1rem;
  }
}

/* ============================================
   ANIMATIONS
   ============================================ */
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

.stat-card,
.chart-card {
  animation: fadeIn 0.6s ease-out;
}
</style>