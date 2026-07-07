import { DOCUMENT_TYPES } from '@/app/constants';
import { getDocumentPreview, getLastVisitDate } from '@/lib/utils';
import type { Consultation } from '@/types/types';
import { ArrowRightIcon, FileText } from 'lucide-react';

interface ConsultationCardProps {
    consultation: Consultation;
}

const ConsultationCard = ({ consultation }: ConsultationCardProps) => {
    const document = consultation.documents?.[0];

    if (!document) {
        return (
            <div className='rounded-xl border border-gray-200 bg-white p-4 text-sm text-muted-foreground'>
                No document generated for this visit
            </div>
        );
    }

    const { label, textColor, bgColor } = DOCUMENT_TYPES[document.type];

    return (
        <div className='flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4'>
            <div className='flex items-center justify-between gap-2'>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${textColor} ${bgColor}`}
                >
                    <FileText className='size-3.5' />
                    {label}
                </span>
                <p className='text-xs text-muted-foreground'>{getLastVisitDate(document.created_at)}</p>
            </div>
            <div className='flex items-start justify-between gap-2'>
                <p className='line-clamp-2 text-sm text-gray-600'>{getDocumentPreview(document.content)}</p>
                <ArrowRightIcon className='text-muted-foreground size-5 shrink-0 self-center' />
            </div>
        </div>
    );
};

export default ConsultationCard;
