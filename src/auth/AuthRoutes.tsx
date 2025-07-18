import { type JSX } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export default function AuthRoutes({ children }: { children: JSX.Element }) {
    const { token, isLoading } = useAuth();
    if (isLoading) {
        return <div>Loading...</div>; // O un spinner, o lo que quieras mostrar mientras se carga
    }
    console.log("Token desde AuthRoutes:", token);

    return token ? children : <Navigate to="/login" replace />;
}