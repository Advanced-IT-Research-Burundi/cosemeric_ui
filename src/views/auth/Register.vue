<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <span class="logo-icon">👥</span>
          <h1>COSEMERIC</h1>
        </div>
        <h2>Create an Account</h2>
        <p class="auth-subtitle">Join our community today</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="name">Full Name</label>
          <div class="input-group">
            <span class="input-icon">👤</span>
            <input
              type="text"
              id="name"
              v-model="name"
              placeholder="Enter your full name"
              required
              :class="{ 'is-invalid': errors.name }"
              @input="clearError('name')"
            >
          </div>
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-group">
            <span class="input-icon">✉️</span>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              required
              :class="{ 'is-invalid': errors.email }"
              @input="clearError('email')"
            >
          </div>
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Create a password"
              required
              :class="{ 'is-invalid': errors.password }"
              @input="clearError('password')"
            >
            <button 
              type="button" 
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div v-if="errors.password" class="invalid-feedback">
            {{ errors.password }}
          </div>
          <div class="password-strength" :class="passwordStrength.class">
            Password strength: {{ passwordStrength.text }}
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
              :class="{ 'is-invalid': errors.confirmPassword }"
              @input="clearError('confirmPassword')"
            >
            <button 
              type="button" 
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="invalid-feedback">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <div class="form-group form-check">
          <input 
            type="checkbox" 
            id="terms" 
            v-model="acceptedTerms"
            class="form-check-input"
            :class="{ 'is-invalid': errors.terms }"
          >
          <label for="terms" class="form-check-label">
            I agree to the <a href="#" @click.prevent="showTerms = true">Terms of Service</a> and 
            <a href="#" @click.prevent="showPrivacy = true">Privacy Policy</a>
          </label>
          <div v-if="errors.terms" class="invalid-feedback">
            {{ errors.terms }}
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-block"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <div class="divider">
        <span>or sign up with</span>
      </div>

      <div class="social-login">
        <button type="button" class="btn btn-social btn-google">
          <i class="fab fa-google"></i> Google
        </button>
        <button type="button" class="btn btn-social btn-facebook">
          <i class="fab fa-facebook-f"></i> Facebook
        </button>
      </div>

      <div class="auth-footer">
        <p>Already have an account? 
          <router-link to="/login" class="auth-link">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
    
    <div class="auth-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- Terms Modal -->
    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Terms of Service</h3>
          <button type="button" class="close-btn" @click="showTerms = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Please read these terms and conditions carefully before using our service.</p>
          <!-- Add your terms of service content here -->
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showTerms = false">I Understand</button>
        </div>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div v-if="showPrivacy" class="modal-overlay" @click.self="showPrivacy = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Privacy Policy</h3>
          <button type="button" class="close-btn" @click="showPrivacy = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Your privacy is important to us. Please read our privacy policy carefully.</p>
          <!-- Add your privacy policy content here -->
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showPrivacy = false">I Understand</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
      showPassword: false,
      showConfirmPassword: false,
      showTerms: false,
      showPrivacy: false,
      isLoading: false,
      errorMessage: '',
      errors: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: ''
      }
    }
  },
  computed: {
    passwordStrength() {
      if (!this.password) return { text: '', class: '' };
      
      // Very basic password strength check
      let strength = 0;
      let text = 'Weak';
      let className = 'weak';
      
      if (this.password.length >= 8) strength++;
      if (this.password.match(/[a-z]+/)) strength++;
      if (this.password.match(/[A-Z]+/)) strength++;
      if (this.password.match(/[0-9]+/)) strength++;
      if (this.password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength++;
      
      if (strength <= 2) {
        text = 'Weak';
        className = 'weak';
      } else if (strength <= 4) {
        text = 'Moderate';
        className = 'moderate';
      } else {
        text = 'Strong';
        className = 'strong';
      }
      
      return { text, class: className };
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = { 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        terms: ''
      };
      
      // Name validation
      if (!this.name.trim()) {
        this.errors.name = 'Full name is required';
        isValid = false;
      } else if (this.name.length < 2) {
        this.errors.name = 'Name is too short';
        isValid = false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(this.email)) {
        this.errors.email = 'Please enter a valid email address';
        isValid = false;
      }
      
      // Password validation
      if (!this.password) {
        this.errors.password = 'Password is required';
        isValid = false;
      } else if (this.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters long';
        isValid = false;
      }
      
      // Confirm password validation
      if (!this.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
      
      // Terms validation
      if (!this.acceptedTerms) {
        this.errors.terms = 'You must accept the terms and conditions';
        isValid = false;
      }
      
      return isValid;
    },
    clearError(field) {
      if (this.errors[field]) {
        this.errors[field] = '';
      }
      this.errorMessage = '';
    },
    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, you would send the registration data to your backend
        console.log('Registering with:', {
          name: this.name,
          email: this.email,
          password: this.password // In a real app, never log passwords
        });
        
        // Simulate successful registration
        this.$toast.success('Registration successful! Please log in.');
        this.$router.push('/login');
      } catch (error) {
        console.error('Registration error:', error);
        this.errorMessage = 'An error occurred during registration. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Auth Container */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

/* Auth Card */
.auth-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  position: relative;
  z-index: 1;
}

/* Auth Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2rem;
  margin-right: 0.75rem;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.auth-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0.5rem 0;
}

.auth-subtitle {
  color: #6c757d;
  margin: 0;
}

/* Form Styles */
.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-group input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group input.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.invalid-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-strength {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-align: center;
  font-weight: 500;
}

.password-strength.weak {
  background-color: #fef2f2;
  color: #dc2626;
}

.password-strength.moderate {
  background-color: #fffbeb;
  color: #d97706;
}

.password-strength.strong {
  background-color: #ecfdf5;
  color: #059669;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--gray-400);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--gray-200);
}

.divider:not(:empty)::before {
  margin-right: 1rem;
}

.divider:not(:empty)::after {
  margin-left: 1rem;
}

.social-login {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid var(--gray-300);
  background-color: white;
  color: var(--gray-700);
  transition: all 0.2s;
}

.btn-social:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}

.btn-google:hover {
  background-color: #f8f1f1;
  border-color: #ea4335;
  color: #ea4335;
}

.btn-facebook:hover {
  background-color: #f0f2f5;
  border-color: #1877f2;
  color: #1877f2;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--gray-900);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--gray-700);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body p {
  margin-bottom: 1rem;
  color: var(--gray-700);
  line-height: 1.6;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Responsive styles */
@media (max-width: 480px) {
  .social-login {
    flex-direction: column;
  }
  
  .btn-social {
    width: 100%;
  }
}
</style>
