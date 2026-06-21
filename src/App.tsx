import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ui/auth/ProtectedRoute';
import { useAppState } from './app/hooks';
import LogIn from './components/LogIn/LogIn';
import Patients from './components/Patients/Patients';
import { ROUTES } from './routes';
import RecordingSession from './components/RecordingSession/RecordingSession';

function App() {
    const { auth } = useAppState();

    return (
        <div className='flex flex-col bg-accent min-h-screen'>
            <Routes>
                <Route path={ROUTES.LOGIN} element={<LogIn />} />
                <Route element={<ProtectedRoute isAuthenticated={auth.isLoggedIn} />}>
                    <Route path={ROUTES.PATIENTS} element={<Patients />} />
                    <Route path={ROUTES.PATIENTS_NEW} element={<div>patients create</div>} />
                    <Route path={ROUTES.CONSULTATION_NEW} element={<div>patients consultation</div>} />
                    <Route path={ROUTES.CONSULTATION_NEW_EXISTING_PATIENT} element={<RecordingSession />} />
                    <Route path={ROUTES.CONSULTATION_DOCUMENT} element={<div>consultation document</div>} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
