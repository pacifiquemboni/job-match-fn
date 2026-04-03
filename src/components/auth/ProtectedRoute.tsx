import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: Array<'WORKER' | 'CLIENT'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};
