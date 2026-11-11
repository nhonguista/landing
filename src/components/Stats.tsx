'use client';

import { useState, useEffect } from 'react';
import { Users, Briefcase, Clock, Map, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { nhonguistaClient, apiFetch } from '@/lib/api';

export function Stats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/stats')
            .then(data => {
                setStats(data);
            })
            .catch(() => {
                // Em caso de falha, não inventar dados fictícios
                setStats(null);
            })
            .finally(() => setLoading(false));
    }, []);

    // Se a API falhou ou não há dados, ocultar ou não exibir números falsos
    if (!stats && !loading) {
        return null;
    }

    const items = [
        { 
            label: "Clientes Registados", 
            value: stats?.nhonguers ?? 0, 
            icon: Users, 
            color: "text-blue-500 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",
            desc: "Usuários na plataforma"
        },
        { 
            label: "Prestadores Activos", 
            value: ((stats?.nhonguistas ?? 0) + (stats?.nhonguista_pro ?? 0)), 
            icon: Briefcase, 
            color: "text-orange-500 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30",
            desc: "Profissionais disponíveis"
        },
        { 
            label: "Serviços Concluídos", 
            value: stats?.nhonga ?? 0, 
            icon: TrendingUp, 
            color: "text-emerald-500 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
            desc: "Conexões realizadas"
        },
        { 
            label: "Províncias", 
            value: stats?.provincias ?? 1, 
            icon: Map, 
            color: "text-amber-500 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30",
            desc: "Foco inicial em Nampula"
        }
    ];

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

    return (
        <section className="px-6 py-20 bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">O Nosso Ecossistema em Números</h3>
                    <p className="text-sm text-zinc-500 mt-1">Dados reais atualizados diretamente da nossa base</p>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div 
                                key={index} 
                                variants={itemVariants}
                                className={`p-6 rounded-3xl border ${item.bg} bg-white dark:bg-zinc-900 flex flex-col justify-between`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{item.label}</span>
                                    <div className={`p-2.5 rounded-2xl ${item.color} bg-zinc-100 dark:bg-zinc-800`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-zinc-900 dark:text-white mb-1">
                                        {loading ? "..." : item.value.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-zinc-400 font-medium">{item.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
