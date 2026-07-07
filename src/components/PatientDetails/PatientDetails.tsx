import { getAgeFromDOB, getLastVisitDate } from '@/lib/utils';
import GoBackBtn from '../common/GoBackBtn';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Edit2 } from 'lucide-react';
import PatientInitials from '../common/PatientInitials';
import type { Patient } from '@/types/types';
import ConsultationCard from './ConsultationCard';
import { ROUTES } from '@/routes';

const PatientDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const patient = location.state.patient as Patient;

    const formattedDOB = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(patient.date_of_birth));

    const visitCount = patient.consultations.length;

    return (
        <section className='flex flex-col p-4'>
            <div className='flex items-center justify-between'>
                <GoBackBtn />
                <Button
                    variant='outline'
                    size='icon'
                    className='rounded-full'
                    onClick={() => console.log('navigate to edit patient')}
                >
                    <Edit2 className='size-4' />
                </Button>
            </div>

            <div className='flex flex-col items-center gap-3 text-center mb-4'>
                <PatientInitials patient={patient} className='size-20 text-2xl' />
                <div>
                    <h3 className='text-xl font-bold'>{patient.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                        {getAgeFromDOB(patient.date_of_birth)}y &middot; {patient.gender === 'MALE' ? 'Male' : 'Female'}{' '}
                        &middot; {formattedDOB}
                    </p>
                </div>
            </div>

            <div className='flex gap-2 mb-4'>
                <div className='flex flex-1 flex-col items-center py-2 rounded-xl border border-gray-200 bg-white'>
                    <p className='text-xl font-bold'>{visitCount}</p>
                    <p className='text-xs font-semibold text-muted-foreground tracking-wider'>VISITS</p>
                </div>
                <div className='flex flex-1 flex-col items-center py-2 rounded-xl border border-gray-200 bg-white'>
                    <p className='text-xl font-bold'>
                        {patient.last_visit ? getLastVisitDate(patient.last_visit) : 'Never'}
                    </p>
                    <p className='text-xs font-semibold text-muted-foreground tracking-wider'>LAST VISIT</p>
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <div className='flex items-baseline justify-between'>
                    <h4 className='font-semibold text-muted-foreground text-center w-full'>Consultations</h4>
                </div>
                {visitCount === 0 ? (
                    <p className='rounded-xl border border-gray-200 bg-white py-8 text-center text-sm text-muted-foreground'>
                        No consultations yet
                    </p>
                ) : (
                    patient.consultations.map((consultation) => (
                        <ConsultationCard key={consultation.id} consultation={consultation} />
                    ))
                )}
            </div>
            <Button
                className='rounded-full fixed bottom-4 right-4 p-5 flex items-center justify-between'
                onClick={() =>
                    navigate(ROUTES.CONSULTATION_NEW_EXISTING_PATIENT.replace(':id', String(patient.id)), {
                        state: { patient },
                    })
                }
            >
                Record visit
            </Button>
        </section>
    );
};

export default PatientDetails;
