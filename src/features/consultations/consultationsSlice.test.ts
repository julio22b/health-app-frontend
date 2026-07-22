import { describe, expect, it, vi } from 'vitest';
import api from '@/api/axiosInstance';
import consultationsReducer, {
    createConsultation,
    processConsultation,
    rerecordConsultation,
    reviewConsultationDocument,
    updateConsultationAudio,
} from './consultationsSlice';
import { createTestStore } from '@/test/test-utils';
import { makeConsultation, makeDocument } from '@/test/fixtures';

describe('consultationsSlice extraReducers', () => {
    describe('createConsultation / updateConsultationAudio (shared matchers)', () => {
        it.each([
            ['createConsultation', createConsultation],
            ['updateConsultationAudio', updateConsultationAudio],
        ])('%s.pending sets loading and clears error', (_name, thunk) => {
            const state = consultationsReducer(
                { currentConsultation: null, document: null, loading: false, error: 'stale error' },
                { type: thunk.pending.type },
            );
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it.each([
            ['createConsultation', createConsultation],
            ['updateConsultationAudio', updateConsultationAudio],
        ])('%s.fulfilled sets currentConsultation and clears document', (_name, thunk) => {
            const consultation = makeConsultation();
            const state = consultationsReducer(
                { currentConsultation: null, document: makeDocument(), loading: true, error: null },
                { type: thunk.fulfilled.type, payload: consultation },
            );
            expect(state.loading).toBe(false);
            expect(state.currentConsultation).toEqual(consultation);
            expect(state.document).toBeNull();
            expect(state.error).toBeNull();
        });

        it.each([
            ['createConsultation', createConsultation],
            ['updateConsultationAudio', updateConsultationAudio],
        ])('%s.rejected sets the error but leaves currentConsultation untouched', (_name, thunk) => {
            const existing = makeConsultation();
            const state = consultationsReducer(
                { currentConsultation: existing, document: null, loading: true, error: null },
                { type: thunk.rejected.type, payload: 'Upload failed' },
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Upload failed');
            expect(state.currentConsultation).toEqual(existing);
        });
    });

    describe('processConsultation', () => {
        it('pending sets loading and clears error', () => {
            const state = consultationsReducer(
                { currentConsultation: null, document: null, loading: false, error: 'stale' },
                { type: processConsultation.pending.type },
            );
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('fulfilled sets both currentConsultation and document from the payload', () => {
            const consultation = makeConsultation();
            const document = makeDocument();
            const state = consultationsReducer(
                { currentConsultation: null, document: null, loading: true, error: null },
                { type: processConsultation.fulfilled.type, payload: { consultation, document, message: 'ok' } },
            );
            expect(state.currentConsultation).toEqual(consultation);
            expect(state.document).toEqual(document);
        });

        it('rejected resets both currentConsultation and document to null (unlike createConsultation.rejected)', () => {
            const state = consultationsReducer(
                { currentConsultation: makeConsultation(), document: makeDocument(), loading: true, error: null },
                { type: processConsultation.rejected.type, payload: 'Processing failed' },
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Processing failed');
            expect(state.currentConsultation).toBeNull();
            expect(state.document).toBeNull();
        });
    });

    describe('reviewConsultationDocument / rerecordConsultation (shared matchers)', () => {
        it.each([
            ['reviewConsultationDocument', reviewConsultationDocument],
            ['rerecordConsultation', rerecordConsultation],
        ])('%s.pending sets loading and clears error', (_name, thunk) => {
            const state = consultationsReducer(
                { currentConsultation: null, document: null, loading: false, error: 'stale' },
                { type: thunk.pending.type },
            );
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it.each([
            ['reviewConsultationDocument', reviewConsultationDocument],
            ['rerecordConsultation', rerecordConsultation],
        ])('%s.fulfilled only clears loading/error, leaving document/currentConsultation untouched', (_name, thunk) => {
            const consultation = makeConsultation();
            const document = makeDocument();
            const state = consultationsReducer(
                { currentConsultation: consultation, document, loading: true, error: null },
                { type: thunk.fulfilled.type, payload: { message: 'ok' } },
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.currentConsultation).toEqual(consultation);
            expect(state.document).toEqual(document);
        });

        it.each([
            ['reviewConsultationDocument', reviewConsultationDocument],
            ['rerecordConsultation', rerecordConsultation],
        ])('%s.rejected sets the error', (_name, thunk) => {
            const state = consultationsReducer(
                { currentConsultation: null, document: null, loading: true, error: null },
                { type: thunk.rejected.type, payload: 'Request failed' },
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Request failed');
        });
    });
});

describe('consultationsSlice thunks call the expected endpoints', () => {
    it('createConsultation POSTs FormData to /consultations', async () => {
        const consultation = makeConsultation();
        vi.mocked(api.post).mockResolvedValueOnce({ data: { consultation, message: 'ok' } });
        const formData = new FormData();
        formData.append('patient_id', '1');

        const store = createTestStore();
        await store.dispatch(createConsultation(formData));

        expect(api.post).toHaveBeenCalledWith('/consultations', formData);
    });

    it('processConsultation POSTs to /consultations/process', async () => {
        const consultation = makeConsultation();
        const document = makeDocument();
        vi.mocked(api.post).mockResolvedValueOnce({ data: { consultation, document, message: 'ok' } });

        const store = createTestStore();
        await store.dispatch(processConsultation({ consultationId: 1, documentType: 'PROGRESS_NOTE' }));

        expect(api.post).toHaveBeenCalledWith('/consultations/process', {
            consultationId: 1,
            documentType: 'PROGRESS_NOTE',
        });
    });

    it('rerecordConsultation DELETEs /documents/:id', async () => {
        vi.mocked(api.delete).mockResolvedValueOnce({ data: { message: 'ok', consultation: makeConsultation() } });

        const store = createTestStore();
        await store.dispatch(rerecordConsultation({ documentId: 7 }));

        expect(api.delete).toHaveBeenCalledWith('/documents/7');
    });

    it('reviewConsultationDocument PATCHes /documents/:id with the new content', async () => {
        vi.mocked(api.patch).mockResolvedValueOnce({ data: { message: 'ok', document: makeDocument() } });

        const store = createTestStore();
        await store.dispatch(reviewConsultationDocument({ documentId: 7, content: 'Updated note' }));

        expect(api.patch).toHaveBeenCalledWith('/documents/7', { content: 'Updated note' });
    });

    it('updateConsultationAudio PATCHes FormData to /consultations/:id/audio', async () => {
        const consultation = makeConsultation();
        vi.mocked(api.patch).mockResolvedValueOnce({ data: { consultation } });
        const formData = new FormData();

        const store = createTestStore();
        await store.dispatch(updateConsultationAudio({ consultationId: 3, formData }));

        expect(api.patch).toHaveBeenCalledWith('/consultations/3/audio', formData);
    });
});
