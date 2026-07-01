export interface Patient {
    id: number;
    name: string;
    date_of_birth: string;
    gender: 'MALE' | 'FEMALE';
    doctor_id: number;
    created_at: string;
    doctor: DoctorWithoutPassword;
    consultations: Consultation[];
    last_visit?: string;
}

export type CreatePatientFormState = Pick<Patient, 'name' | 'date_of_birth' | 'gender'>;

interface Doctor {
    id: number;
    name: string;
    username: string;
    password: string;
    specialty?: string;
    created_at: string;
    updated_at: string;
    patients: Patient[];
}

export type DoctorWithoutPassword = Omit<Doctor, 'password'>;

type ConsultationStatuses = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type DocumentType = 'MEDICAL_HISTORY' | 'PROGRESS_NOTE' | 'DISCHARGE_SUMMARY';

export interface Document {
    id: number;
    consultation_id: number;
    consultation: Consultation;
    type: DocumentType;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Consultation {
    id: number;
    patient_id: number;
    patient: Patient;
    audio_url?: string;
    transcript_text?: string;
    status: ConsultationStatuses;
    created_at: string;
    documents: Document[];
}

export interface CreateConsultationPayload {
    patient_id: number;
    audio: Blob;
    document_type: DocumentType;
}
export interface LogInResponse {
    token: string;
    message: string;
    doctor: DoctorWithoutPassword;
}

export interface ProcessConsultationResponse {
    consultation: Consultation;
    message: string;
    document: Document;
}

export interface RerecordConsultationResponse {
    message: string;
    consultation: Consultation;
}

export interface ReviewConsultationResponse {
    message: string;
    document: Document;
}

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'processing' | 'consultation_created' | 'done';
