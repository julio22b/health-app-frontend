import axios from 'axios';
import { toast } from 'sonner';

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        _wakeupTimer?: ReturnType<typeof setTimeout>;
    }
}

const WAKEUP_TOAST_ID = 'server-wakeup';
const WAKEUP_THRESHOLD_MS = 3000;

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
        return Promise.reject(error);
    },
);

export default api;
