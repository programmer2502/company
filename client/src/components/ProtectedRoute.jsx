import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        // If not logged in, redirect to login page. 
        // If adminOnly is true, redirect to admin-login
        return <Navigate to={adminOnly ? "/admin-login" : "/login"} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // If logged in but not admin, redirect to home or admin login?
        // User said "dont allow for others", usually means 403 or redirect.
        // Redirecting to admin-login allows them to try with an admin account if they have one.
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};

export default ProtectedRoute;
