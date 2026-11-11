'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

export function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Consome diretamente através do SDK oficial Nhonguista
        nhonguistaClient.categories.list()
            .then((data: any) => {
                if (Array.isArray(data)) {
                    setCategories(data.slice(0, 8));
                } else if (data?.data && Array.isArray(data.data)) {
                    setCategories(data.data.slice(0, 8));
                } else {
                    setCategories([]);
                }
            })
            .catch((err: any) => {
                console.error("Erro ao carregar categorias da API:", err);
                setError("Não foi possível carregar as categorias neste momento.");
                setCategories([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <Container as="section" className="py-24">
                <div className="flex items-center justify-between mb-12">
                    <div className="h-10 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                    <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl"></div>
                    ))}
                </div>
            </Container>
        );
    }

    return (
        <Container as="section" className="py-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Explorar Categorias</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">Encontre especialistas para cada necessidade</p>
                </div>
                <Link 
                    href="/servicos" 
                    className="group flex items-center gap-2 text-brand font-bold hover:text-brand-dark transition-colors"
                >
                    Ver todas as categorias
                    <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {error && (
                <div className="p-6 mb-8 text-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-sm">
                    {error}
                </div>
            )}

            {categories.length === 0 && !error ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <Icons.FolderOpen className="w-12 h-12 mx-auto mb-3 text-zinc-400 stroke-1" />
                    <p className="text-base font-medium">Nenhuma categoria cadastrada no momento.</p>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                    {categories.map((cat) => {
                        const iconKey = cat.icon || 'LayoutGrid';
                        const IconComponent = (Icons as any)[iconKey] || Icons.LayoutGrid;
                        
                        return (
                            <motion.div key={cat.id} variants={itemVariants}>
                                <Link 
                                    href={`/servicos?category=${cat.slug}`}
                                    className="group relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-10 bg-white dark:bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(253,67,0,0.2)] dark:hover:shadow-[0_20px_40px_-15px_rgba(253,67,0,0.3)] hover:border-brand/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="relative z-10 p-5 rounded-2xl mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-brand/10 text-brand dark:bg-brand/20">
                                        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
                                    </div>
                                    <span className="relative z-10 font-bold text-lg text-zinc-900 dark:text-zinc-100 text-center group-hover:text-brand transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </Container>
    );
}
