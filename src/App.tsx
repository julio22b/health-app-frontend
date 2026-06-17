import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ui/auth/ProtectedRoute';

function App() {
    const user = { isLoggedIn: true };
    return (
        <Routes>
            <Route path='/login' element={<App />} />
            <Route element={<ProtectedRoute isAuthenticated={user.isLoggedIn} />}>
                <Route path='/patients' element={<div>patients</div>} />
                <Route path='/patients/new' element={<div>patients create</div>} />
                <Route path='/patients/consultation/new' element={<div>patients consultation</div>} />
                <Route path='/consultations/:id/document' element={<div>consultation document</div>} />
            </Route>
        </Routes>
    );
}

export default App;
