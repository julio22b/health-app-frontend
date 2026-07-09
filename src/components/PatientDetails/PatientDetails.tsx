import { getAgeFromDOB, getLastVisitDate, parseDateOnly } from '@/lib/utils';
import GoBackBtn from '../common/GoBackBtn';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Edit2, Mic, Trash } from 'lucide-react';
import PatientInitials from '../common/PatientInitials';
import ConsultationCard from './ConsultationCard';
import { ROUTES } from '@/routes';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { deletePatient, fetchPatient, setPatientDetails } from '@/features/patients/patientsSlice';
import { useEffect } from 'react';
import FullPageLoader from '../common/FullPageLoader';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { toast } from 'sonner';

const PatientDetails = () => {
    const { patientDetails: patient, loading, error } = useAppSelector((state) => state.patients);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const params = useParams();

    useEffect(() => {
        if (!params.id) return;

        dispatch(fetchPatient(Number(params.id)));

        return () => {
            dispatch(setPatientDetails(null));
        };
    }, [dispatch, params.id]);

    if (!patient) {
        return error ? <p>No patient found</p> : <FullPageLoader />;
    }

    const formattedDOB = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(parseDateOnly(patient.date_of_birth));

    const visitCount = patient.consultations.length;

    const handleDelete = async () => {
        try {
            await dispatch(deletePatient(patient.id)).unwrap();
            toast.success('Patient deleted');
            navigate(-1);
        } catch {
            toast.error('Error deleting patient');
        }
    };

    return (
        <section className='flex flex-col p-4'>
            {loading && <FullPageLoader />}
            <div className='flex items-center justify-between'>
                <GoBackBtn />
                <div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' size='icon' className='rounded-full mr-2'>
                                <Trash />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete patient</DialogTitle>
                                <DialogDescription>This patient will be removed from your list.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant='destructive' className='rounded-full' onClick={handleDelete}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant='outline'
                        size='icon'
                        className='rounded-full'
                        onClick={() =>
                            navigate(ROUTES.PATIENTS_EDIT.replace(':id', String(patient.id)), {
                                state: { patientToEdit: patient },
                            })
                        }
                    >
                        <Edit2 />
                    </Button>
                </div>
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
                className='rounded-full fixed bottom-4 right-[max(1rem,calc(50%-23rem))] p-5 flex items-center justify-between'
                onClick={() =>
                    navigate(ROUTES.CONSULTATION_NEW_EXISTING_PATIENT.replace(':id', String(patient.id)), {
                        state: { patient },
                    })
                }
            >
                <Mic />
                Record visit
            </Button>
        </section>
    );
};

export default PatientDetails;
