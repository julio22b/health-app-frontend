import { describe, expect, it, vi } from 'vitest';
import api from '@/api/axiosInstance';
import patientsReducer, {
    createPatient,
    deletePatient,
    fetchPatient,
    fetchPatients,
    setPatientDetails,
    setSearch,
    updatePatient,
} from './patientsSlice';
import { createTestStore } from '@/test/test-utils';
import { makePatient } from '@/test/fixtures';

describe('patientsSlice reducers', () => {
    it('setSearch updates the search term', () => {
        const state = patientsReducer(undefined, setSearch('jane'));
        expect(state.search).toBe('jane');
    });

    it('setPatientDetails sets and clears patientDetails', () => {
        const patient = makePatient();
        const withDetails = patientsReducer(undefined, setPatientDetails(patient));
        expect(withDetails.patientDetails).toEqual(patient);

        const cleared = patientsReducer(withDetails, setPatientDetails(null));
        expect(cleared.patientDetails).toBeNull();
    });
});

describe('patientsSlice extraReducers', () => {
    it('sets loading and clears error on any pending action', () => {
        const state = patientsReducer(undefined, { type: fetchPatients.pending.type });
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('sets the error and clears loading on any rejected action', () => {
        const state = patientsReducer(undefined, { type: fetchPatients.rejected.type, payload: 'Network error' });
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Network error');
    });

    it('fetchPatients.fulfilled replaces the patients list', () => {
        const patients = [makePatient({ id: 1 }), makePatient({ id: 2 })];
        const state = patientsReducer(undefined, { type: fetchPatients.fulfilled.type, payload: { patients } });
        expect(state.patients).toEqual(patients);
    });

    it('createPatient.fulfilled prepends the new patient', () => {
        const existing = patientsReducer(undefined, {
            type: fetchPatients.fulfilled.type,
            payload: { patients: [makePatient({ id: 1 })] },
        });
        const newPatient = makePatient({ id: 2, name: 'New Patient' });
        const state = patientsReducer(existing, { type: createPatient.fulfilled.type, payload: newPatient });
        expect(state.patients.map((p) => p.id)).toEqual([2, 1]);
    });

    it('fetchPatient.fulfilled sets patientDetails', () => {
        const patient = makePatient();
        const state = patientsReducer(undefined, { type: fetchPatient.fulfilled.type, payload: patient });
        expect(state.patientDetails).toEqual(patient);
    });

    it('updatePatient.fulfilled updates the patient in the list and syncs matching patientDetails', () => {
        const original = makePatient({ id: 1, name: 'Old Name' });
        let state = patientsReducer(undefined, { type: fetchPatients.fulfilled.type, payload: { patients: [original] } });
        state = patientsReducer(state, { type: fetchPatient.fulfilled.type, payload: original });

        const updated = { ...original, name: 'New Name' };
        state = patientsReducer(state, { type: updatePatient.fulfilled.type, payload: updated });

        expect(state.patients[0].name).toBe('New Name');
        expect(state.patientDetails?.name).toBe('New Name');
    });

    it('updatePatient.fulfilled leaves patientDetails untouched when it belongs to a different patient', () => {
        const listPatient = makePatient({ id: 1, name: 'Old Name' });
        const otherPatient = makePatient({ id: 2, name: 'Someone Else' });
        let state = patientsReducer(undefined, {
            type: fetchPatients.fulfilled.type,
            payload: { patients: [listPatient] },
        });
        state = patientsReducer(state, { type: fetchPatient.fulfilled.type, payload: otherPatient });

        const updated = { ...listPatient, name: 'New Name' };
        state = patientsReducer(state, { type: updatePatient.fulfilled.type, payload: updated });

        expect(state.patientDetails).toEqual(otherPatient);
    });

    it('deletePatient.fulfilled removes the patient from the list and clears matching patientDetails', () => {
        const patient = makePatient({ id: 1 });
        let state = patientsReducer(undefined, { type: fetchPatients.fulfilled.type, payload: { patients: [patient] } });
        state = patientsReducer(state, { type: fetchPatient.fulfilled.type, payload: patient });

        state = patientsReducer(state, { type: deletePatient.fulfilled.type, payload: patient.id });

        expect(state.patients).toEqual([]);
        expect(state.patientDetails).toBeNull();
    });
});

describe('patientsSlice thunks call the expected endpoints', () => {
    it('fetchPatients calls GET /patients', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({ data: { patients: [] } });
        const store = createTestStore();
        await store.dispatch(fetchPatients());
        expect(api.get).toHaveBeenCalledWith('/patients');
    });

    it('createPatient calls POST /patients', async () => {
        const patient = makePatient();
        vi.mocked(api.post).mockResolvedValueOnce({ data: { patient } });
        const store = createTestStore();
        await store.dispatch(
            createPatient({ name: patient.name, date_of_birth: patient.date_of_birth, gender: patient.gender }),
        );
        expect(api.post).toHaveBeenCalledWith('/patients', {
            name: patient.name,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
        });
    });

    it('updatePatient calls PUT /patients/:id', async () => {
        const patient = makePatient({ id: 5 });
        vi.mocked(api.put).mockResolvedValueOnce({ data: { patient } });
        const store = createTestStore();
        await store.dispatch(
            updatePatient({ id: 5, name: patient.name, date_of_birth: patient.date_of_birth, gender: patient.gender }),
        );
        expect(api.put).toHaveBeenCalledWith('/patients/5', {
            id: 5,
            name: patient.name,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
        });
    });

    it('deletePatient calls PATCH /patients/:id (soft delete), not DELETE', async () => {
        vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
        const store = createTestStore();
        await store.dispatch(deletePatient(5));
        expect(api.patch).toHaveBeenCalledWith('/patients/5');
        expect(api.delete).not.toHaveBeenCalled();
    });
});
