export const CONSULTATION_STATUSES = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
} as const;

export const DOCUMENT_TYPES = {
    MEDICAL_HISTORY: { value: 'MEDICAL_HISTORY', label: 'SOAP Note' },
    PROGRESS_NOTE: { value: 'PROGRESS_NOTE', label: 'Progress' },
    DISCHARGE_SUMMARY: { value: 'DISCHARGE_SUMMARY', label: 'Discharge' },
    // FOLLOW_UP_PLAN: { value: "FOLLOW_UP_PLAN", label: "Follow Up" },
} as const;

export const RECORDING_STATUSES = {
    idle: 'idle',
    recording: 'recording',
    paused: 'paused',
    processing: 'processing',
    done: 'done',
} as const;
