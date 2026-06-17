import api from '@/api/axiosInstance';
import type { LogInResponse, DoctorWithoutPassword } from '@/types/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/utils';

interface AuthStateInterface {
    isLoggedIn: boolean;
    doctor: DoctorWithoutPassword | null;
    error: string | null;
    loading: boolean;
    token: string;
}

const initialState: AuthStateInterface = {
    isLoggedIn: !!localStorage.getItem('token'),
    doctor: null,
    error: null,
    loading: false,
    token: localStorage.getItem('token') || '',
};

export const logIn = createAsyncThunk(
    'login',
    async (credentials: { username: string; password: string }, thunkAPI) => {
        try {
            const response = await api.post<LogInResponse>('/auth/login', credentials);
            return response.data;
        } catch (error: unknown) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    },
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logOut: (state) => {
            state.isLoggedIn = false;
            state.doctor = null;
            state.error = null;
            state.loading = false;
            state.token = '';

            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(logIn.pending, (state) => {
                state.loading = true;
            })
            .addCase(logIn.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.doctor = action.payload.doctor;
                state.error = null;
                state.token = action.payload.token;

                localStorage.setItem('token', action.payload.token);
            })
            .addCase(logIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logOut } = authSlice.actions;

export default authSlice;
