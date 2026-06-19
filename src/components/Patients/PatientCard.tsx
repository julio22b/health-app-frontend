import type { Patient } from '@/types/types';
import { Card, CardContent } from '../ui/card';
import { getAge, getAvatarColor, getLastVisitDate } from '@/lib/utils';
import { ArrowRightIcon } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '@/routes';

interface PatientCardProps {
    patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
    const { bg, text } = getAvatarColor(patient.id);
    const patientNames = patient.name.split(' ');
    const initials = patientNames
        .slice(0, 2)
        .map((name) => name[0].toUpperCase())
        .join('');

    return (
        <Card className='shadow-md'>
            <Link
                to={generatePath(ROUTES.CONSULTATION_NEW_EXISTING_PATIENT, { id: patient.id.toString() })}
                state={{ patient }}
            >
                <CardContent className='flex items-center gap-4'>
                    <div
                        className={`w-13 h-13 text-lg tracking-wider rounded-full ${bg} ${text} font-bold text-center flex items-center justify-center`}
                    >
                        {initials}
                    </div>
                    <div>
                        <p>{patient.name}</p>
                        <p className='text-sm text-muted-foreground'>
                            {getAge(patient.date_of_birth)} years old - Last visit{' '}
                            {patient.last_visit ? getLastVisitDate(patient.last_visit) : 'never'}
                        </p>
                    </div>
                    <ArrowRightIcon className='ml-auto text-muted-foreground' />
                </CardContent>
            </Link>
        </Card>
    );
};

export default PatientCard;
