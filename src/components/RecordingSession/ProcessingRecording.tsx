import { CircleCheck } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { DocumentType } from '@/types/types';
import { DOCUMENT_TYPES } from '@/app/constants';

interface ProcessingRecordingProps {
    documentType: DocumentType;
    isConsultationCreated: boolean;
    isConsultationProcessed: boolean;
    time: string;
}

const ProcessingRecording = ({
    documentType,
    isConsultationCreated,
    isConsultationProcessed,
    time,
}: ProcessingRecordingProps) => {
    const documentTypeLabel = DOCUMENT_TYPES[documentType].label;

    return (
        <div className='flex flex-col items-center gap-4 absolute inset-14'>
            <div
                className={`flex items-center gap-2 border border-gray-200 rounded-lg py-2 px-4 ${isConsultationCreated ? '' : 'bg-blue-50'}`}
            >
                {isConsultationCreated ? (
                    <CircleCheck className='text-white fill-green-500 size-8' />
                ) : (
                    <LoadingSpinner className='text-blue-500 size-8' />
                )}
                <div>
                    <p className='text-sm font-semibold'>Creating consultation</p>
                    <p className='text-xs text-muted-foreground'>Saving the visit to the chart</p>
                </div>
            </div>
            <div
                className={`flex items-center gap-2 border border-gray-200 rounded-lg py-2 px-4 ${isConsultationProcessed ? '' : 'bg-blue-50'}`}
            >
                {isConsultationProcessed ? (
                    <CircleCheck className='text-white fill-green-500 size-8' />
                ) : (
                    <LoadingSpinner className='text-blue-500 size-8' />
                )}
                <div>
                    <p className='text-sm font-semibold'>Generating {documentTypeLabel}</p>
                    <p className='text-xs text-muted-foreground'>Saving the visit to the chart</p>
                </div>
            </div>
            {(!isConsultationCreated || !isConsultationProcessed) && (
                <p className='text-sm text-muted-foreground text-center w-70'>
                    Processing {time} of audio. Keep this screen open until the process is complete.
                </p>
            )}
            {isConsultationCreated && isConsultationProcessed && (
                <p className='text-sm text-green-600 text-center w-70'>
                    Both steps are completed. Taking you to review...
                </p>
            )}
        </div>
    );
};

export default ProcessingRecording;
