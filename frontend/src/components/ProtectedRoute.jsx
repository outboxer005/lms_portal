import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(user.role)) {
                return <Navigate to="/" replace />;
            }
        } else if (user.role !== requiredRole) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};
