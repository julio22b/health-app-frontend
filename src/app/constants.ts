export const CONSULTATION_STATUSES = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
} as const;

export const DOCUMENT_TYPES = {
    MEDICAL_HISTORY: {
        value: 'MEDICAL_HISTORY',
        label: 'Med Hx',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    PROGRESS_NOTE: {
        value: 'PROGRESS_NOTE',
        label: 'Progress note',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    DISCHARGE_SUMMARY: {
        value: 'DISCHARGE_SUMMARY',
        label: 'Discharge',
        textColor: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    // FOLLOW_UP_PLAN: { value: "FOLLOW_UP_PLAN", label: "Follow Up" },
} as const;

export const RECORDING_STATUSES = {
    idle: 'idle',
    recording: 'recording',
    paused: 'paused',
    processing: 'processing',
    done: 'done',
} as const;

export const PATIENT_FORM_INITIAL_STATE = {
    name: '',
    date_of_birth: '',
    gender: 'MALE',
} as const;
