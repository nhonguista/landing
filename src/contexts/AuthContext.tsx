'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { nhonguistaClient, apiFetch } from '@/lib/api';
import type { User, ProviderProfile, Company } from '@nhonguista/sdk';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (phone: string, password: string) => Promise<void>;
    register: (data: {
        name: string;
        email?: string;
        phone: string;
        password: string;
        role?: 'client' | 'provider' | 'admin';
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    hasRole: (roleSlug: string) => boolean;
    isProvider: boolean;
    isAdmin: boolean;
    isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const syncToken = (authToken: string | null) => {
        setToken(authToken);
        nhonguistaClient.setAuthToken(authToken);
        if (authToken) {
            localStorage.setItem('nhonguista_token', authToken);
        } else {
            localStorage.removeItem('nhonguista_token');
        }
    };

    const syncUser = (authUser: User | null) => {
        setUser(authUser);
        if (authUser) {
            localStorage.setItem('nhonguista_user', JSON.stringify(authUser));
        } else {
            localStorage.removeItem('nhonguista_user');
        }
    };

    const refreshUser = async () => {
        try {
            const currentToken = localStorage.getItem('nhonguista_token');
            if (!currentToken) return;

            nhonguistaClient.setAuthToken(currentToken);
            const response = await nhonguistaClient.auth.me();
            if (response && response.user) {
                syncUser(response.user);
            }
        } catch (err) {
            console.warn('Falha ao atualizar sessão do utilizador:', err);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('nhonguista_token');
        const storedUser = localStorage.getItem('nhonguista_user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                nhonguistaClient.setAuthToken(storedToken);
                // Background refresh
                refreshUser();
            } catch (e) {
                console.error('Erro ao ler utilizador armazenado:', e);
                localStorage.removeItem('nhonguista_token');
                localStorage.removeItem('nhonguista_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (phone: string, password: string) => {
        const response = await nhonguistaClient.auth.login(phone, password);
        const { user: loggedUser, token: authToken } = response;
        syncToken(authToken);
        syncUser(loggedUser);
    };

    const register = async (formData: {
        name: string;
        email?: string;
        phone: string;
        password: string;
        role?: 'client' | 'provider' | 'admin';
    }) => {
        const response = await nhonguistaClient.auth.register(formData);
        const { user: registeredUser, token: authToken } = response;
        syncToken(authToken);
        syncUser(registeredUser);
    };

    const logout = async () => {
        try {
            if (token) {
                await nhonguistaClient.auth.logout().catch(() => {});
            }
        } finally {
            syncToken(null);
            syncUser(null);
        }
    };

    const hasRole = (roleSlug: string) => {
        return user?.roles?.some(role => role.slug === roleSlug) || false;
    };

    const isProvider = hasRole('provider');
    const isAdmin = hasRole('admin');
    const isClient = hasRole('client');

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            loading, 
            login, 
            register, 
            logout, 
            refreshUser,
            isAuthenticated: !!token,
            hasRole,
            isProvider,
            isAdmin,
            isClient
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
