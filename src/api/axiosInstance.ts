import axios from 'axios';
import { toast } from 'sonner';
import { ROUTES } from '@/routes';

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        _wakeupTimer?: ReturnType<typeof setTimeout>;
    }
}

const WAKEUP_TOAST_ID = 'server-wakeup';
const WAKEUP_THRESHOLD_MS = 3000;
let isRedirectingToLogin = false;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config?.url?.includes('consultations') || config?.url?.includes('documents')) return config;

    config._wakeupTimer = setTimeout(() => {
        toast.loading('Server is waking up…', {
            id: WAKEUP_TOAST_ID,
            description: 'This may take a few seconds.',
            duration: Infinity,
        });
    }, WAKEUP_THRESHOLD_MS);

    return config;
});

api.interceptors.response.use(
    (response) => {
        clearTimeout(response.config._wakeupTimer);
        toast.dismiss(WAKEUP_TOAST_ID);
        return response;
    },
    (error) => {
        clearTimeout(error.config?._wakeupTimer);
        toast.dismiss(WAKEUP_TOAST_ID);

        if (error.response?.status === 401 && !error.config?.url?.includes('/auth') && !isRedirectingToLogin) {
            isRedirectingToLogin = true;
            localStorage.removeItem('token');
            window.location.replace(ROUTES.LOGIN);
        }

        return Promise.reject(error);
    },
);

export default api;
