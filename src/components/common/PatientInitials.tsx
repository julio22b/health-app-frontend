import { cn, getAvatarColor } from '@/lib/utils';
import type { Patient } from '@/types/types';

const PatientInitials = ({ patient, className }: { patient: Patient; className?: string }) => {
    const { bg, text } = getAvatarColor(patient.id);
    const initials = patient.name
        .split(' ')
        .slice(0, 2)
        .map((name) => name[0].toUpperCase())
        .join('');

    return (
        <div
            className={cn(
                `size-12 text-lg tracking-wider rounded-full ${bg} ${text} font-bold text-center flex items-center justify-center`,
                className,
            )}
        >
            {initials}
        </div>
    );
};

export default PatientInitials;
