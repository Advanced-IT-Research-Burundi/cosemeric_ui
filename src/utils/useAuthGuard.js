
import { computed } from 'vue';
import useAuthStore from '../stores/auth';

const useAuthGuard = () => {
    const authStore = useAuthStore();
    console.log("authStore.user", authStore.user)

    const isAdmin = computed(() => authStore.user.role === 'admin');
    const isMember = computed(() => authStore.user.role === 'membre');
    const isGuest = computed(() => !authStore.user);
    const isAuth = computed(() => authStore.isAuthenticated);

    return {
        authStore,
        isAdmin,
        isMember,
        isGuest,
        isAuth
    }
}

export default useAuthGuard;
