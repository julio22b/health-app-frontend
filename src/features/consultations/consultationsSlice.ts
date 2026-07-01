import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import {
    type Consultation,
    type DocumentType,
    type Document,
    type ProcessConsultationResponse,
    type RerecordConsultationResponse,
    type ReviewConsultationResponse,
} from '@/types/types';
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
    { consultationId: number; documentType: DocumentType },
    { rejectValue: string }
>('consultations/processConsultation', async (payload, thunkAPI) => {
    try {
        const data = (await api.post<ProcessConsultationResponse>('/consultations/process', payload)).data;
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
});

export const rerecordConsultation = createAsyncThunk<
    RerecordConsultationResponse,
    { documentId: number },
    { rejectValue: string }
>('consultations/rerecordConsultation', async ({ documentId }, thunkAPI) => {
    try {
        const data = (await api.delete(`/documents/${documentId}`)).data;
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
});

export const reviewConsultationDocument = createAsyncThunk<
    ReviewConsultationResponse,
    { documentId: number; content: string },
    { rejectValue: string }
>('consultations/reviewConsultationDocument', async ({ documentId, content }, thunkAPI) => {
    try {
        const data = (
            await api.patch(`/documents/${documentId}`, {
                content,
            })
        ).data;
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
});

export const updateConsultationAudio = createAsyncThunk<
    Consultation,
    { consultationId: number; formData: FormData },
    { rejectValue: string }
>('consultations/updateConsultationAudio', async ({ consultationId, formData }, thunkAPI) => {
    try {
        const data = (await api.patch(`/consultations/${consultationId}/audio`, formData)).data.consultation;
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
            .addCase(processConsultation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processConsultation.fulfilled, (state, action) => {
                state.loading = false;
                state.currentConsultation = action.payload.consultation;
                state.document = action.payload.document;
                state.error = null;
            })
            .addCase(processConsultation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
                state.currentConsultation = null;
                state.document = null;
            })
            .addMatcher(isAnyOf(createConsultation.pending, updateConsultationAudio.pending), (state) => {
                state.loading = true;
                state.error = null;
            })
            .addMatcher(
                isAnyOf(createConsultation.fulfilled, updateConsultationAudio.fulfilled),
                (state, action) => {
                    state.loading = false;
                    state.currentConsultation = action.payload;
                    state.document = null;
                    state.error = null;
                },
            )
            .addMatcher(
                isAnyOf(createConsultation.rejected, updateConsultationAudio.rejected),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload ?? null;
                },
            )
            .addMatcher(isAnyOf(reviewConsultationDocument.fulfilled, rerecordConsultation.fulfilled), (state) => {
                state.loading = false;
                state.error = null;
            })
            .addMatcher(
                isAnyOf(reviewConsultationDocument.rejected, rerecordConsultation.rejected),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload ?? null;
                },
            )
            .addMatcher(isAnyOf(reviewConsultationDocument.pending, rerecordConsultation.pending), (state) => {
                state.loading = true;
                state.error = null;
            });
    },
});

export default consultationsSlice.reducer;
