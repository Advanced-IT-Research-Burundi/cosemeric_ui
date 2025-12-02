<template>
  <div class="admin-dashboard">
    <!-- Top Navigation -->

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div v-for="stat in statistics" :key="stat.id" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.gradient }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label">{{ stat.label }}</p>
            <h3 class="stat-value">{{ stat.value }}</h3>
            <div class="stat-footer">
              <span class="stat-change" :class="stat.trend">
                <i
                  :class="
                    stat.trend === 'up'
                      ? 'bi bi-arrow-up-short'
                      : 'bi bi-arrow-down-short'
                  "
                ></i>
                {{ stat.change }}
              </span>
              <small class="text-muted">vs mois dernier</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Recent Transactions -->
        <div class="content-card large-card">
          <div class="card-header-custom">
            <h5 class="card-title-custom">
              <i class="bi bi-clock-history me-2"></i>
              Transactions récentes
            </h5>
            <a href="#" class="btn btn-sm btn-outline-primary">
              Voir tout
              <i class="bi bi-arrow-right ms-1"></i>
            </a>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="transaction in recentTransactions"
                  :key="transaction.id"
                >
                  <td>
                    <div class="d-flex align-items-center">
                      <div
                        class="avatar-circle me-3"
                        :style="{ background: transaction.avatarColor }"
                      >
                        {{ transaction.membre.charAt(0) }}
                      </div>
                      <div>
                        <div class="fw-semibold">{{ transaction.membre }}</div>
                        <small class="text-muted">{{ transaction.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span :class="getTypeBadge(transaction.type)">
                      {{ transaction.type }}
                    </span>
                  </td>
                  <td class="fw-bold">
                    {{ formatCurrency(transaction.montant) }}
                  </td>
                  <td class="text-muted">{{ transaction.date }}</td>
                  <td>
                    <span :class="getStatusBadge(transaction.status)">
                      <i :class="getStatusIcon(transaction.status)"></i>
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-light me-1"
                      title="Voir détails"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-light" title="Plus d'options">
                      <i class="bi bi-three-dots"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="content-card">
          <div class="card-header-custom">
            <h5 class="card-title-custom">
              <i class="bi bi-lightning-charge-fill me-2"></i>
              Actions rapides
            </h5>
          </div>
          <div class="quick-actions-grid">
            <button
              v-for="action in quickActions"
              :key="action.id"
              class="quick-action-card"
              :style="{ borderColor: action.color }"
              @click="$router.push(action.url)"
            >
              <div class="action-icon" :style="{ background: action.gradient }">
                <i :class="action.icon"></i>
              </div>
              <span class="action-label">{{ action.label }}</span>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="content-card">
          <div class="card-header-custom">
            <h5 class="card-title-custom">
              <i class="bi bi-activity me-2"></i>
              Activité récente
            </h5>
          </div>
          <div class="activity-timeline">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="timeline-item"
            >
              <div
                class="timeline-marker"
                :style="{ background: activity.color }"
              >
                <i :class="activity.icon"></i>
              </div>
              <div class="timeline-content">
                <p class="timeline-text">{{ activity.text }}</p>
                <small class="timeline-time">
                  <i class="bi bi-clock me-1"></i>
                  {{ activity.time }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="content-card mt-4">
        <div class="card-header-custom">
          <h5 class="card-title-custom">
            <i class="bi bi-graph-up-arrow me-2"></i>
            Évolution des transactions
          </h5>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm" style="width: auto">
              <option>Tous les types</option>
              <option>Cotisations</option>
              <option>Crédits</option>
              <option>Dettes</option>
            </select>
            <select class="form-select form-select-sm" style="width: auto">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-icon">
            <i class="bi bi-bar-chart-line-fill"></i>
          </div>
          <h5 class="mb-2">Graphique des transactions mensuelles</h5>
          <p class="text-muted mb-3">
            Visualisez l'évolution de vos transactions sur l'année
          </p>
          <button class="btn btn-outline-primary btn-sm">
            <i class="bi bi-plus-circle me-2"></i>
            Intégrer Chart.js ou Recharts
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

const router = useRouter();

export default {
  name: "AdminDashboard",
  data() {
    return {
      activeMenu: "dashboard",
      menuItems: [
        {
          id: "dashboard",
          label: "Tableau de bord",
          icon: "bi bi-speedometer2",
        },
        { id: "members", label: "Membres", icon: "bi bi-people" },
        {
          id: "transactions",
          label: "Transactions",
          icon: "bi bi-arrow-left-right",
        },
        { id: "reports", label: "Rapports", icon: "bi bi-file-earmark-text" },
        { id: "loans", label: "Crédits", icon: "bi bi-credit-card" },
      ],
      statistics: [
        {
          id: 1,
          label: "Solde total",
          value: "2 450 000 BIF",
          change: "+12.5%",
          trend: "up",
          icon: "bi bi-wallet2",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        {
          id: 2,
          label: "Membres actifs",
          value: "156",
          change: "+8 nouveaux",
          trend: "up",
          icon: "bi bi-people-fill",
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        },
        {
          id: 3,
          label: "Crédits en cours",
          value: "24",
          change: "-3 ce mois",
          trend: "down",
          icon: "bi bi-credit-card-2-front",
          gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        },
        {
          id: 4,
          label: "Transactions du mois",
          value: "89",
          change: "+15.3%",
          trend: "up",
          icon: "bi bi-arrow-left-right",
          gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        },
      ],
      recentTransactions: [
        {
          id: "T-001",
          membre: "Jean Dupont",
          type: "Cotisation",
          montant: 5000,
          date: "02 Oct 2024",
          status: "Validé",
          avatarColor: "#667eea",
        },
        {
          id: "T-002",
          membre: "Marie Martin",
          type: "Crédit",
          montant: 15000,
          date: "02 Oct 2024",
          status: "En attente",
          avatarColor: "#f093fb",
        },
        {
          id: "T-003",
          membre: "Paul Durand",
          type: "Dette",
          montant: 8000,
          date: "01 Oct 2024",
          status: "Validé",
          avatarColor: "#4facfe",
        },
        {
          id: "T-004",
          membre: "Sophie Bernard",
          type: "Assistance",
          montant: 3000,
          date: "01 Oct 2024",
          status: "Validé",
          avatarColor: "#43e97b",
        },
        {
          id: "T-005",
          membre: "Luc Petit",
          type: "Cotisation",
          montant: 5000,
          date: "30 Sep 2024",
          status: "Rejeté",
          avatarColor: "#f5576c",
        },
      ],
      quickActions: [
        {
          id: 1,
          label: "Ajouter membre",
          icon: "bi bi-person-plus-fill",
          color: "#667eea",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          url: "/members",
        },
        {
          id: 2,
          label: "Nouvelle cotisation",
          icon: "bi bi-cash-coin",
          color: "#43e97b",
          gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          url: "/contributions",
        },
        {
          id: 3,
          label: "Accorder crédit",
          icon: "bi bi-credit-card-fill",
          color: "#4facfe",
          gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          url: "/credits",
        },
        {
          id: 4,
          label: "Générer rapport",
          icon: "bi bi-file-earmark-pdf-fill",
          color: "#f5576c",
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          url: "/reports",
        },
      ],
      recentActivity: [
        {
          id: 1,
          text: "Nouveau membre inscrit : Emma Rousseau",
          time: "Il y a 5 min",
          icon: "bi bi-person-check-fill",
          color: "#43e97b",
        },
        {
          id: 2,
          text: "Cotisation validée pour Jean Dupont",
          time: "Il y a 12 min",
          icon: "bi bi-check-circle-fill",
          color: "#667eea",
        },
        {
          id: 3,
          text: "Crédit de 15 000 BIF approuvé",
          time: "Il y a 1h",
          icon: "bi bi-credit-card-fill",
          color: "#4facfe",
        },
        {
          id: 4,
          text: "Rapport mensuel généré avec succès",
          time: "Il y a 2h",
          icon: "bi bi-file-earmark-check",
          color: "#f093fb",
        },
        {
          id: 5,
          text: "Mise à jour du système effectuée",
          time: "Il y a 3h",
          icon: "bi bi-gear-fill",
          color: "#ffa726",
        },
      ],
    };
  },
  methods: {
    getCurrentDate() {
      return new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "BIF",
      }).format(amount);
    },
    getTypeBadge(type) {
      const badges = {
        Cotisation: "badge bg-primary",
        Crédit: "badge bg-success",
        Dette: "badge bg-warning text-dark",
        Assistance: "badge bg-info text-dark",
      };
      return badges[type] || "badge bg-secondary";
    },
    getStatusBadge(status) {
      const badges = {
        Validé: "status-badge success",
        "En attente": "status-badge warning",
        Rejeté: "status-badge danger",
      };
      return badges[status] || "status-badge secondary";
    },
    getStatusIcon(status) {
      const icons = {
        Validé: "bi bi-check-circle-fill",
        "En attente": "bi bi-clock-fill",
        Rejeté: "bi bi-x-circle-fill",
      };
      return icons[status] || "bi bi-circle-fill";
    },
    logout() {
      if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        alert("Déconnexion en cours...");
      }
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* TOP NAVBAR */
.top-navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-right: auto;
}

.navbar-brand i {
  font-size: 2rem;
}

.navbar-brand h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.navbar-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-link i {
  font-size: 1.1rem;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-light {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-light:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  color: white;
}

/* MAIN CONTENT */
.main-content {
  padding: 2.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: #64748b;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

/* STATISTICS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-change {
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.stat-change.up {
  color: #10b981;
}

.stat-change.down {
  color: #ef4444;
}

.stat-change i {
  font-size: 1.25rem;
}

/* CONTENT GRID */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.large-card {
  grid-row: span 2;
}

.content-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.card-title-custom {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
}

/* TABLE */
.table {
  margin: 0;
}

.table thead th {
  border-bottom: 2px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem 0.75rem;
}

.table tbody td {
  padding: 1.25rem 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.avatar-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.badge {
  padding: 0.45rem 0.85rem;
  font-weight: 500;
  font-size: 0.8rem;
  border-radius: 6px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

/* QUICK ACTIONS */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
}

.action-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
  text-align: center;
}

/* ACTIVITY TIMELINE */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timeline-marker {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
  padding-top: 0.25rem;
}

.timeline-text {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 500;
}

.timeline-time {
  color: #94a3b8;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

/* CHART PLACEHOLDER */
.chart-placeholder {
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
}

.chart-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-icon i {
  font-size: 3rem;
  color: #667eea;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .large-card {
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .top-navbar {
    flex-wrap: wrap;
    padding: 1rem;
  }

  .navbar-menu {
    width: 100%;
    order: 3;
    margin-top: 1rem;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .nav-link span {
    display: none;
  }

  .main-content {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
