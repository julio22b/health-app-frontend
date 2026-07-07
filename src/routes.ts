export const ROUTES = {
    LOGIN: '/login',
    PATIENTS: '/patients',
    PATIENT_DETAILS: '/patients/:id',
    PATIENTS_NEW: '/patients/new',
    CONSULTATION_NEW: '/patients/consultation/new',
    CONSULTATION_NEW_EXISTING_PATIENT: '/patients/:id/consultation/new',
    CONSULTATION_DOCUMENT: '/consultations/:id/document',
    CONSULTATION_REVIEW: '/consultations/:id/review',
} as const;
