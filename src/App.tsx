import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './components/ui/auth/ProtectedRoute';
import { useAppState } from './app/hooks';
import LogIn from './components/LogIn/LogIn';
import Patients from './components/Patients/Patients';
import { ROUTES } from './routes';
import RecordingSession from './components/RecordingSession/RecordingSession';
import ReviewConsultation from './components/ReviewConsultation/ReviewConsultation';
import PatientForm from './components/Patients/PatientForm';
import { Toaster } from 'sonner';
import { CircleCheck } from 'lucide-react';
import FullPageLoader from './components/common/FullPageLoader';
import { useEffect, useState } from 'react';
import { subscribeServerWakeup } from './lib/serverWakeup';
import PatientDetails from './components/PatientDetails/PatientDetails';

function App() {
    const { auth } = useAppState();
    const [serverWakingUp, setServerWakingUp] = useState(false);

    useEffect(() => subscribeServerWakeup(setServerWakingUp), []);

    return (
        <div className='flex flex-col bg-accent min-h-screen'>
            <Toaster icons={{ success: <CircleCheck className='text-green-500' /> }} />
            {serverWakingUp && (
                <FullPageLoader message='Server is waking up…' description='This may take a few seconds.' />
            )}
            <div className='relative mx-auto w-full max-w-3xl flex-1 bg-background md:shadow-sm'>
                <Routes>
                    <Route
                        path='/'
                        element={<Navigate to={auth.isLoggedIn ? ROUTES.PATIENTS : ROUTES.LOGIN} replace />}
                    />
                    <Route path={ROUTES.LOGIN} element={<LogIn />} />
                    <Route element={<ProtectedRoute isAuthenticated={auth.isLoggedIn} />}>
                        <Route path={ROUTES.PATIENTS} element={<Patients />} />
                        <Route path={ROUTES.PATIENT_DETAILS} element={<PatientDetails />} />
                        <Route path={ROUTES.PATIENTS_NEW} element={<PatientForm />} />
                        <Route path={ROUTES.PATIENTS_EDIT} element={<PatientForm />} />
                        <Route path={ROUTES.CONSULTATION_NEW} element={<RecordingSession />} />
                        <Route path={ROUTES.CONSULTATION_NEW_EXISTING_PATIENT} element={<RecordingSession />} />
                        <Route path={ROUTES.CONSULTATION_DOCUMENT} element={<div>consultation document</div>} />
                        <Route path={ROUTES.CONSULTATION_REVIEW} element={<ReviewConsultation />} />
                    </Route>
                </Routes>
            </div>
        </div>
    );
}

export default App;
