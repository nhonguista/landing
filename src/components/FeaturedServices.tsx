'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { nhonguistaClient } from '@/lib/api';
import { Container, Avatar, AvatarFallback, AvatarImage, Badge } from '@nhonguista/ui';

interface Service {
    id: string;
    title: string;
    description: string;
    price_min: string;
    price_type: string;
    images: string[];
    user?: { name: string; avatar: string | null };
    category?: { name: string };
    location?: { name: string };
    average_rating?: number;
}

export function FeaturedServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Consome serviços em destaque via SDK oficial
        nhonguistaClient.services.list({ featured: '1', per_page: '12' })
            .then((data: any) => {
                const rawServices: Service[] = data?.data || [];
                // Lógica para pegar um de cada categoria (até 6)
                const uniqueByCategory: Service[] = [];
                const seenCategories = new Set();
                
                rawServices.forEach(s => {
                    const categoryName = s.category?.name || 'Geral';
                    if (!seenCategories.has(categoryName) && uniqueByCategory.length < 6) {
                        uniqueByCategory.push(s);
                        seenCategories.add(categoryName);
                    }
                });

                if (uniqueByCategory.length < 6) {
                    rawServices.forEach(s => {
                        if (!uniqueByCategory.find(u => u.id === s.id) && uniqueByCategory.length < 6) {
                            uniqueByCategory.push(s);
                        }
                    });
                }

                setServices(uniqueByCategory);
            })
            .catch(err => {
                console.error("Erro ao carregar serviços em destaque da API:", err);
                setError("Não foi possível carregar os serviços em destaque no momento.");
                setServices([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <section className="px-6 py-24 bg-zinc-50/50 dark:bg-zinc-950">
                <Container>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                        <div className="space-y-3">
                            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                            <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[420px] bg-zinc-100 dark:bg-zinc-900 rounded-3xl"></div>
                        ))}
                    </div>
                </Container>
            </section>
        );
    }

    return (
        <section className="px-6 py-24 bg-zinc-50/50 dark:bg-zinc-950 border-y border-zinc-100 dark:border-zinc-900">
            <Container>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand font-semibold text-xs mb-4">
                            Em Destaque
                        </div>
                        <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Serviços Populares</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg">Profissionais bem avaliados prontos para ajudar</p>
                    </div>
                    <Link 
                        href="/servicos" 
                        className="group flex items-center gap-2 text-brand font-bold hover:text-brand-dark transition-colors"
                    >
                        Ver todos os serviços
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {error && (
                    <div className="p-6 mb-8 text-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-sm">
                        {error}
                    </div>
                )}

                {services.length === 0 && !error ? (
                    <div className="p-16 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 text-zinc-400 stroke-1" />
                        <p className="text-base font-medium">Nenhum serviço em destaque encontrado no momento.</p>
                        <p className="text-sm text-zinc-400 mt-1">Explore o catálogo geral para consultar outros serviços disponíveis.</p>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {services.map((service) => (
                            <motion.div key={service.id} variants={itemVariants}>
                                <div className="group h-full flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
                                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        {service.images && service.images[0] ? (
                                            <img 
                                                src={service.images[0]} 
                                                alt={service.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <Briefcase className="w-10 h-10 opacity-30" />
                                            </div>
                                        )}
                                        {service.category?.name && (
                                            <div className="absolute top-4 left-4">
                                                <Badge variant="secondary" className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-0 text-zinc-800 dark:text-zinc-200 font-medium">
                                                    {service.category.name}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>{service.location?.name || 'Nampula'}</span>
                                            {service.average_rating && (
                                                <>
                                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                    <div className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                        <span>{service.average_rating.toFixed(1)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2 line-clamp-1 group-hover:text-brand transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-6 flex-1">
                                            {service.description}
                                        </p>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={service.user?.avatar || undefined} />
                                                    <AvatarFallback>{service.user?.name ? service.user.name.slice(0, 2).toUpperCase() : 'NH'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                    {service.user?.name || 'Profissional'}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs text-zinc-400 block">A partir de</span>
                                                <span className="font-black text-brand text-lg">
                                                    {service.price_min ? `${Number(service.price_min).toLocaleString()} MT` : 'Sob Consulta'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </Container>
        </section>
    );
}
