import api from '@/api/axiosInstance';
import { getErrorMessage } from '@/lib/utils';
import type { Patient } from '@/types/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface PatientsStateInterface {
    patients: Patient[];
    loading: boolean;
    error: string | null;
    search: string;
}

const initialState: PatientsStateInterface = {
    patients: [],
    loading: false,
    error: null,
    search: '',
};

export const fetchPatients = createAsyncThunk('patients/fetchPatients', async (_, thunkAPI) => {
    try {
        const data = (await api.get<{ patients: Patient[] }>('/patients')).data;
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
});

export const patientsSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.patients = action.payload.patients;
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});
