import { useLocation, useNavigate } from 'react-router';
import type { Consultation, Document, DocumentType, Patient } from '@/types/types';
import PatientHeader from '../common/PatientHeader';
import { DOCUMENT_TYPES } from '@/app/constants';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { Button } from '../ui/button';
import { SaveIcon, RotateCcw } from 'lucide-react';
import { ROUTES } from '@/routes';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { rerecordConsultation, reviewConsultationDocument } from '@/features/consultations/consultationsSlice';
import FullPageLoader from '../common/FullPageLoader';

const ReviewConsultation = () => {
    const loading = useAppSelector((state) => state.consultations.loading);
    const location = useLocation();
    const { consultation, documentType, patient, document } = (location.state ?? {}) as {
        consultation: Consultation;
        documentType: DocumentType;
        patient: Patient;
        document: Document;
    };
    const [content, setContent] = useState(document?.content ?? '');
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSave = async () => {
        try {
            setLoadingMessage('Saving the visit to the chart');
            await dispatch(reviewConsultationDocument({ documentId: document.id, content })).unwrap();
            navigate(ROUTES.PATIENTS);
            toast.success('Consultation saved to chart');
        } catch (error) {
            toast.error('Error saving consultation: ' + error);
        }
    };

    const handleRerecord = async () => {
        try {
            setLoadingMessage('Preparing to rerecord consultation');
            await dispatch(rerecordConsultation({ documentId: document.id })).unwrap();
            navigate(ROUTES.CONSULTATION_NEW_EXISTING_PATIENT.replace(':id', String(patient.id)), {
                state: { patient, existingConsultation: consultation },
            });
        } catch (error) {
            toast.error('Error rerecording consultation: ' + error);
        }
    };

    if (!document) return <p>error</p>;

    return (
        <section className='flex flex-col p-4 gap-6'>
            {loading && <FullPageLoader message={loadingMessage} />}
            <PatientHeader patient={patient} />
            <div className='w-full border border-gray-200 rounded-lg p-4 text-sm bg-white overflow-auto'>
                <p className='font-bold m-2 border-b border-gray-100 pb-2'>
                    {DOCUMENT_TYPES[documentType]?.label || ''}
                </p>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className='border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm'
                />
            </div>
            <div className='flex justify-end gap-2'>
                <Button className='flex-2 py-6' variant='outline' onClick={handleRerecord}>
                    <RotateCcw className='size-6' />
                    <p className='text-sm text-center'>Re-record</p>
                </Button>
                <Button className='flex-4 py-6' onClick={handleSave}>
                    <SaveIcon className='size-6' />
                    <p className='text-sm text-center'>Save to chart</p>
                </Button>
            </div>
        </section>
    );
};

export default ReviewConsultation;
