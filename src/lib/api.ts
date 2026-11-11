import { createClient } from '@nhonguista/sdk';

// Base URL configuration for Nhonguista API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
// Extract root origin (e.g. http://localhost:8000) for SDK
const SDK_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Instância oficial do SDK Nhonguista
export const nhonguistaClient = createClient({
    baseUrl: SDK_BASE_URL,
    timeout: 10000,
});

interface RequestOptions extends RequestInit {
    token?: string;
}

/**
 * Cliente HTTP unificado da Landing que utiliza a mesma URL base e cabeçalhos padrão.
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...rest } = options;
    
    const headers = new Headers(rest.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Garante formato consistente do endpoint com prefixo /api
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = normalizedEndpoint.startsWith('/api') 
        ? `${SDK_BASE_URL}${normalizedEndpoint}` 
        : `${SDK_BASE_URL}/api${normalizedEndpoint}`;

    const response = await fetch(fullUrl, {
        ...rest,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ocorreu um erro inesperado.' }));
        throw new Error(error.message || `Erro na requisição: ${response.status}`);
    }

    return response.json();
}
