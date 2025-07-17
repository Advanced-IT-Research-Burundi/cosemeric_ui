<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total Members</h3>
          <p class="stat-value">1,248</p>
          <span class="stat-change positive">+12% from last month</span>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                <i class="fas fa-hand-holding-usd fs-4 text-success"></i>
              </div>
              <div>
                <h6 class="mb-1 text-muted">Monthly Contributions</h6>
                <h3 class="mb-0">$24,580</h3>
                <small class="text-success">
                  <i class="fas fa-arrow-up me-1"></i> 8.2% from last month
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                <i class="fas fa-file-invoice-dollar fs-4 text-warning"></i>
              </div>
              <div>
                <h6 class="mb-1 text-muted">Active Loans</h6>
                <h3 class="mb-0">$156,230</h3>
                <small class="text-danger">
                  <i class="fas fa-arrow-down me-1"></i> 3.5% from last month
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-info bg-opacity-10 p-3 rounded-3 me-3">
                <i class="fas fa-hands-helping fs-4 text-info"></i>
              </div>
              <div>
                <h6 class="mb-1 text-muted">Pending Assistance</h6>
                <h3 class="mb-0">18</h3>
                <small class="text-success">
                  <i class="fas fa-arrow-up me-1"></i> 2 new this week
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Activity</h5>
            <router-link to="/reports/activity" class="btn btn-sm btn-outline-secondary">
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="(activity, index) in recentActivities" :key="index" 
                   class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                  <div class="d-flex">
                    <div class="me-3">
                      <span class="avatar" :class="`bg-${activity.type}`">
                        <i :class="activity.icon"></i>
                      </span>
                    </div>
                    <div>
                      <h6 class="mb-1">{{ activity.title }}</h6>
                      <p class="mb-0 text-muted small">{{ activity.description }}</p>
                    </div>
                  </div>
                  <small class="text-muted">{{ activity.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="col-lg-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <router-link to="/members/add" class="btn btn-outline-primary text-start">
                <i class="fas fa-user-plus me-2"></i> Add New Member
              </router-link>
              <router-link to="/contributions/record-payment" class="btn btn-outline-success text-start">
                <i class="fas fa-hand-holding-usd me-2"></i> Record Payment
              </router-link>
              <router-link to="/credits/new-applications" class="btn btn-outline-info text-start">
                <i class="fas fa-file-alt me-2"></i> New Loan Application
              </router-link>
              <router-link to="/assistance/new-requests" class="btn btn-outline-warning text-start">
                <i class="fas fa-hands-helping me-2"></i> Request Assistance
              </router-link>
              <router-link to="/reports/monthly-summary" class="btn btn-outline-secondary text-start">
                <i class="fas fa-chart-bar me-2"></i> View Reports
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseView>
</template>

<script>
import BaseView from './BaseView.vue'

export default {
  name: 'Dashboard',
  components: {
    BaseView
  },
  data() {
    return {
      recentActivities: [
        {
          title: 'New Member Registered',
          description: 'John Doe has been added to the system',
          time: '10 min ago',
          type: 'primary',
          icon: 'fas fa-user-plus'
        },
        {
          title: 'Payment Received',
          description: 'Monthly contribution from Jane Smith ($100.00)',
          time: '1 hour ago',
          type: 'success',
          icon: 'fas fa-check-circle'
        },
        {
          title: 'Loan Application',
          description: 'New loan application from Robert Johnson ($5,000)',
          time: '3 hours ago',
          type: 'info',
          icon: 'fas fa-file-alt'
        },
        {
          title: 'Assistance Request',
          description: 'New assistance request from Sarah Williams',
          time: '5 hours ago',
          type: 'warning',
          icon: 'fas fa-hands-helping'
        },
        {
          title: 'System Update',
          description: 'Monthly system maintenance completed',
          time: '1 day ago',
          type: 'secondary',
          icon: 'fas fa-sync'
        }
      ]
    };
  }
};
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar.bg-primary { background-color: #0d6efd; }
.avatar.bg-success { background-color: #198754; }
.avatar.bg-info { background-color: #0dcaf0; }
.avatar.bg-warning { background-color: #ffc107; }
.avatar.bg-secondary { background-color: #6c757d; }

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.list-group-item {
  border-left: none;
  border-right: none;
  padding: 1rem 1.25rem;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.btn-outline-primary {
  border-color: #e9ecef;
}

.btn-outline-primary:hover {
  background-color: #f8f9fa;
  border-color: #e9ecef;
}
  gap: 1rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  display: block;
}

.action-button span:last-child {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
