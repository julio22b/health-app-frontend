import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
}

const ProtectedRoute = ({ isAuthenticated }: ProtectedRouteProps) => {
    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
