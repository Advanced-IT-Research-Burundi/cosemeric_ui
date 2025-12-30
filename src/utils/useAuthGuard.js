
import { computed } from 'vue';
import useAuthStore from '../stores/auth';

const useAuthGuard = () => {
    const authStore = useAuthStore();
    console.log("authStore.user", authStore.user)

    const isAdmin = computed(() => authStore.user?.role === 'admin');
    const isMember = computed(() => authStore.user?.role === 'membre');
    const isManager = computed(() => authStore.user?.role === 'gestionnaire');
    const isResponsable = computed(() => authStore.user?.role === 'responsable');
    const isGuest = computed(() => !authStore.user);
    const isAuth = computed(() => authStore.isAuthenticated);

    return {
        authStore,
        isAdmin,
        isResponsable,
        isMember,
        isManager,  
        isGuest,
        isAuth
    }
}

export default useAuthGuard;
