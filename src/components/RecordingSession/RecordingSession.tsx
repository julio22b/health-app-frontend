import { ArrowLeft, InfoIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router';
import type { Patient } from '@/types/types';

const RecordingSession = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state.patient as Patient | null;

    return (
        <section className='flex flex-col bg-accent h-screen'>
            <header className='flex items-center justify-between p-4'>
                <Button variant='outline' className='rounded-full' onClick={() => navigate(-1)}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className='text-sm tracking-wider text-center text-muted-foreground'>Recording Session</h1>
                    <p className='font-bold text-center'>{patient && patient.name}</p>
                </div>
                <InfoIcon />
            </header>
        </section>
    );
};

export default RecordingSession;
