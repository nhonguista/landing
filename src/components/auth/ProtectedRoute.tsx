'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@nhonguista/ui';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'provider' | 'admin' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, loading, user, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <p className="text-sm font-medium text-zinc-500">A validar sessão...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && !hasRole(requiredRole) && !hasRole('admin')) {
        return (
            <Container className="py-20">
                <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Acesso Restrito
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                        A sua conta não possui privilégios de <strong>{requiredRole}</strong> para aceder a esta secção.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition"
                    >
                        Voltar à Página Inicial
                    </button>
                </div>
            </Container>
        );
    }

    return <>{children}</>;
}
