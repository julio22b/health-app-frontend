import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { type Consultation, type DocumentType, type Document, type ProcessConsultationResponse } from '@/types/types';
import api from '@/api/axiosInstance';
import { getErrorMessage } from '@/lib/utils';

interface ConsultationsState {
    currentConsultation: Consultation | null;
    document: Document | null;
    loading: boolean;
    error: string | null;
}

const initialState: ConsultationsState = {
    currentConsultation: null,
    document: null,
    loading: false,
    error: null,
};

export const createConsultation = createAsyncThunk<Consultation, FormData, { rejectValue: string }>(
    'consultations/createConsultation',
    async (payload, thunkAPI) => {
        try {
            const data = (await api.post<{ consultation: Consultation; message: string }>('/consultations', payload))
                .data.consultation;
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(getErrorMessage(error));
        }
    },
);

export const processConsultation = createAsyncThunk<
    ProcessConsultationResponse,
    { consultationID: number; documentType: DocumentType },
    { rejectValue: string }
>('consultations/processConsultation', async (payload, thunkAPI) => {
    try {
        const data = (await api.post<ProcessConsultationResponse>('/consultations/process', payload)).data;
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
});

const consultationsSlice = createSlice({
    name: 'consultations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createConsultation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConsultation.fulfilled, (state, action) => {
                state.loading = false;
                state.currentConsultation = action.payload;
                state.document = null;
                state.error = null;
            })
            .addCase(createConsultation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            });
    },
});

export default consultationsSlice.reducer;
