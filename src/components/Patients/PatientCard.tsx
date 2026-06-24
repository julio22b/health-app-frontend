import type { Patient } from '@/types/types';
import { Card, CardContent } from '../ui/card';
import { getAge, getLastVisitDate } from '@/lib/utils';
import { ArrowRightIcon } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { ROUTES } from '@/routes';
import PatientInitials from '../common/PatientInitials';

interface PatientCardProps {
    patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
    return (
        <Card className='shadow-md'>
            <Link
                to={generatePath(ROUTES.CONSULTATION_NEW_EXISTING_PATIENT, { id: patient.id.toString() })}
                state={{ patient }}
            >
                <CardContent className='flex items-center gap-4'>
                    <PatientInitials patient={patient} />
                    <div>
                        <p>{patient.name}</p>
                        <p className='text-sm text-muted-foreground'>
                            {getAge(patient.date_of_birth)}y &middot; Last visit{' '}
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
