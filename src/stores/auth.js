import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const toast = useToast();
  
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('auth_token') || null);
  const returnUrl = ref(null);
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // Actions
  async function login(email, password) {
    try {
      const response = await api.post('/login', { 
        email: email.trim(),
        password: password
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }

      // Map backend response to our user object
      const { user: userData, access_token, token_type, expires_at } = response.data;
      
      const userObj = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.telephone,
        role: userData.role,
        lastLogin: userData.last_login_at,
        isActive: userData.is_active
      };

      // Update state
      user.value = userObj;
      token.value = access_token;

      // Store user details and token in local storage
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_type', token_type);
      localStorage.setItem('token_expires', expires_at);

      // Set default authorization header
      api.setAuthToken(access_token);

      // Redirect to previous URL or dashboard
      const redirectTo = returnUrl.value || '/dashboard';
      returnUrl.value = null;
      router.push(redirectTo);
      
      toast.success(response.data.message || 'Connexion réussie');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  }

  async function register(userData) {
    try {
      const response = await api.post('/register', {
        nom: userData.lastName.trim(),
        prenom: userData.firstName.trim(),
        email: userData.email.trim(),
        telephone: userData.phone,
        password: userData.password,
        password_confirmation: userData.password_confirmation
      });
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }

      // Map backend response to our user object
      const { user: userData, access_token, token_type, expires_at } = response.data;
      
      const userObj = {
        id: userData.id,
        firstName: userData.prenom,
        lastName: userData.nom,
        fullName: userData.full_name,
        email: userData.email,
        phone: userData.telephone,
        role: userData.role,
        isActive: userData.is_active,
        createdAt: userData.created_at
      };

      // Update state
      user.value = userObj;
      token.value = access_token;

      // Store user details and token in local storage
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_type', token_type);
      localStorage.setItem('token_expires', expires_at);

      // Set default authorization header
      api.setAuthToken(access_token);

      // Redirect to dashboard
      router.push('/dashboard');
      
      toast.success(response.data.message || 'Inscription réussie');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  }

  function logout() {
    // Clear state
    user.value = null;
    token.value = null;
    
    // Remove from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('token_expires');
    
    // Clear auth header
    api.clearAuthToken();
    
    // Redirect to login
    router.push('/login');
    
    toast.success('Vous avez été déconnecté avec succès');
  }

  function setReturnUrl(url) {
    returnUrl.value = url;
  }

  // Initialize store from local storage
  function initialize() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
      
      // Set the authorization header
      if (tokenType) {
        api.setAuthToken(storedToken);
      }
    }
  }

  // Initialize on store creation
  initialize();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isAdmin,
    // Actions
    login,
    register,
    logout,
    setReturnUrl,
    initialize
  };
}, {
  persist: true // This will persist the store in localStorage
});

if(import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
export default useAuthStore;
