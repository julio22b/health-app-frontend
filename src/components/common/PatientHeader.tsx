import { getAge } from '@/lib/utils';
import { Home } from 'lucide-react';
import GoBackBtn from './GoBackBtn';
import PatientInitials from './PatientInitials';
import type { Patient } from '@/types/types';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/routes';

interface PatientHeaderInterface {
    patient: Patient;
}

const PatientHeader = ({ patient }: PatientHeaderInterface) => {
    const navigate = useNavigate();

    return (
        <header className='flex items-center justify-between'>
            <GoBackBtn />
            {patient && (
                <div className='flex items-baseline gap-2'>
                    <PatientInitials patient={patient} className='size-8 text-sm' />
                    <p className='font-bold text-center'>{patient && patient.name}</p>
                    <p className='text-sm text-muted-foreground'>{getAge(patient.date_of_birth)}y</p>
                </div>
            )}
            <Button variant='outline' size='icon' className='rounded-full' onClick={() => navigate(ROUTES.PATIENTS)}>
                <Home />
            </Button>
        </header>
    );
};

export default PatientHeader;
