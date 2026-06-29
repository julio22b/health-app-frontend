import { getAge } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import GoBackBtn from './GoBackBtn';
import PatientInitials from './PatientInitials';
import type { Patient } from '@/types/types';

interface PatientHeaderInterface {
    patient: Patient;
}

const PatientHeader = ({ patient }: PatientHeaderInterface) => {
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
            <InfoIcon />
        </header>
    );
};

export default PatientHeader;
