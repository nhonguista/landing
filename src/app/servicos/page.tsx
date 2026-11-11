'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ArrowLeft, Star, Briefcase } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Service {
    id: string;
    title: string;
    description: string;
    price_min: string;
    price_type: string;
    images?: string[];
    user?: { name: string };
    category?: { name: string; slug: string };
    location?: { name: string };
}

function ServicesContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || '';
    const initialSearch = searchParams.get('search') || '';

    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: initialCategory,
        search: initialSearch,
    });

    useEffect(() => {
        // Fetch categories for the filter
        apiFetch('/categories')
            .then((data: any) => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (data?.data && Array.isArray(data.data)) {
                    setCategories(data.data);
                } else {
                    setCategories([]);
                }
            })
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        setLoading(true);
        const queryParams: Record<string, string> = {};
        if (filters.category) queryParams.category = filters.category;
        if (filters.search) queryParams.search = filters.search;

        const query = new URLSearchParams(queryParams).toString();
        const endpoint = query ? `/services?${query}` : '/services';

        apiFetch(endpoint)
            .then((data: any) => {
                if (Array.isArray(data)) {
                    setServices(data);
                } else if (data?.data && Array.isArray(data.data)) {
                    setServices(data.data);
                } else {
                    setServices([]);
                }
            })
            .catch(() => setServices([]))
            .finally(() => setLoading(false));
    }, [filters]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header / Search */}
            <div className="bg-white dark:bg-black border-b border-zinc-100 dark:border-zinc-900 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                    <Link href="/" className="mr-4 text-zinc-400 hover:text-orange-600">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar por serviço..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                            className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 rounded-full border-none outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        <button 
                            onClick={() => setFilters({...filters, category: ''})}
                            className={cn(
                                "px-4 h-10 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                                filters.category === '' ? "bg-orange-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                            )}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setFilters({...filters, category: cat.slug})}
                                className={cn(
                                    "px-4 h-10 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                                    filters.category === cat.slug ? "bg-orange-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                        {filters.category ? `Serviços de ${categories.find(c => c.slug === filters.category)?.name || filters.category}` : 'Todos os Serviços'}
                    </h1>
                    <span className="text-sm text-zinc-500">{services.length} resultados encontrados</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-80 bg-white dark:bg-zinc-900 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map(service => (
                            <Link 
                                key={service.id} 
                                href={`/servicos/${service.id}`}
                                className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-zinc-100 dark:border-zinc-800"
                            >
                                <div className="relative h-48 bg-zinc-200 dark:bg-zinc-800">
                                    {service.images && service.images[0] ? (
                                        <img 
                                            src={service.images[0]} 
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                            <Briefcase className="w-10 h-10 opacity-30" />
                                        </div>
                                    )}
                                    {service.category?.name && (
                                        <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-black text-orange-600 uppercase">
                                            {service.category.name}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                                        {service.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                                        <MapPin className="w-3 h-3" />
                                        {service.location?.name || 'Nampula'}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
                                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                                            {service.price_min ? `${Number(service.price_min).toLocaleString()} MT` : 'Sob Consulta'}
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-500">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-xs font-bold">5.0</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-6">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Nenhum serviço encontrado</h3>
                        <p className="text-zinc-500 mt-2">Tente ajustar os seus filtros ou pesquisar por outro termo.</p>
                        <button 
                            onClick={() => setFilters({category: '', search: ''})}
                            className="mt-6 text-orange-600 font-bold hover:underline"
                        >
                            Limpar todos os filtros
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <ServicesContent />
        </Suspense>
    );
}
