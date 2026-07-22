import type { Consultation, Document, DoctorWithoutPassword, Patient } from '@/types/types';

export const makeDoctor = (overrides: Partial<DoctorWithoutPassword> = {}): DoctorWithoutPassword => ({
    id: 1,
    name: 'Dr. Test',
    username: 'test',
    created_at: '',
    updated_at: '',
    patients: [],
    ...overrides,
});

export const makePatient = (overrides: Partial<Patient> = {}): Patient => ({
    id: 1,
    name: 'Jane Doe',
    date_of_birth: '1990-05-20',
    gender: 'FEMALE',
    doctor_id: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    doctor: makeDoctor(),
    consultations: [],
    ...overrides,
});

export const makeConsultation = (overrides: Partial<Consultation> = {}): Consultation => ({
    id: 1,
    patient_id: 1,
    status: 'PENDING',
    created_at: '2024-01-01T00:00:00.000Z',
    documents: [],
    ...overrides,
});

export const makeDocument = (overrides: Partial<Document> = {}): Document => ({
    id: 1,
    consultation_id: 1,
    type: 'PROGRESS_NOTE',
    content: 'Some content',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
});
