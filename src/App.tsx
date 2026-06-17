import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ui/auth/ProtectedRoute';
import { useAppState } from './app/hooks';
import LogIn from './components/LogIn/LogIn';
import Patients from './components/Patients/Patients';

function App() {
    const { auth } = useAppState();

    return (
        <Routes>
            <Route path='/login' element={<LogIn />} />
            <Route element={<ProtectedRoute isAuthenticated={auth.isLoggedIn} />}>
                <Route path='/patients' element={<Patients />} />
                <Route path='/patients/new' element={<div>patients create</div>} />
                <Route path='/patients/consultation/new' element={<div>patients consultation</div>} />
                <Route path='/consultations/:id/document' element={<div>consultation document</div>} />
            </Route>
        </Routes>
    );
}

export default App;
