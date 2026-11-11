'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    LayoutDashboard, 
    Briefcase, 
    User, 
    ShieldCheck, 
    PhoneCall, 
    Star, 
    Plus, 
    ArrowUpRight,
    CheckCircle2,
    Clock,
    CreditCard
} from 'lucide-react';
import type { Service, Lead, Plan, Subscription } from '@nhonguista/sdk';

export default function ProviderDashboardPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const [myServices, myLeads, allPlans, mySubscriptions] = await Promise.all([
                    nhonguistaClient.services.mine().catch(() => []),
                    nhonguistaClient.leads.mine().catch(() => []),
                    nhonguistaClient.plans.list().catch(() => []),
                    nhonguistaClient.plans.mySubscriptions().catch(() => [])
                ]);

                setServices(myServices);
                setLeads(myLeads);
                setPlans(allPlans);

                const active = mySubscriptions.find(s => s.status === 'active');
                if (active) setActiveSubscription(active);
            } catch (err) {
                console.error('Erro ao carregar dados do painel:', err);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const activeServicesCount = services.filter(s => s.is_active).length;
    const currentPlanName = activeSubscription?.plan?.name || user?.provider_profile?.subscription_tier || 'Plano Básico';

    return (
        <ProtectedRoute requiredRole="provider">
            <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
                <Container>
                    {/* Cabeçalho do Painel */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full">
                                    Área do Prestador
                                </span>
                                {user?.provider_profile?.is_verified && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Verificado
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                Olá, {user?.name}
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                Faixa de gestão operacional, catálogo de serviços e contactos recebidos.
                            </p>
                        </div>

                        {/* Atalhos rápidos */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link 
                                href="/dashboard/servicos"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-md shadow-orange-600/20 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Novo Serviço
                            </Link>
                            <Link 
                                href="/dashboard/verificacao"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:border-orange-500 transition"
                            >
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Verificação
                            </Link>
                            <Link 
                                href="/dashboard/perfil"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:border-orange-500 transition"
                            >
                                <User className="w-4 h-4 text-orange-600" />
                                Editar Perfil
                            </Link>
                        </div>
                    </div>

                    {/* Cartões de Métricas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between text-zinc-500 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Serviços Ativos</span>
                                <Briefcase className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                                {loading ? '...' : activeServicesCount}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Total de {services.length} serviços cadastrados
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between text-zinc-500 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Contactos / Leads</span>
                                <PhoneCall className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                                {loading ? '...' : leads.length}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Conversões diretas via WhatsApp
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between text-zinc-500 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Avaliação Média</span>
                                <Star className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                                {user?.provider_profile?.rating_average ? Number(user.provider_profile.rating_average).toFixed(1) : '5.0'}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {user?.provider_profile?.rating_count || 0} avaliações validadas
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between text-zinc-500 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Subscrição Ativa</span>
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="text-xl font-black text-zinc-900 dark:text-zinc-50 capitalize">
                                {loading ? '...' : currentPlanName}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                Limite atual de serviços compatível
                            </p>
                        </div>
                    </div>

                    {/* Grelha de Conteúdo Principal: Serviços + Leads Recentes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Meus Serviços */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                    Os Meus Serviços Publicados
                                </h2>
                                <Link 
                                    href="/dashboard/servicos"
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                >
                                    Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-zinc-500">A carregar serviços...</div>
                            ) : services.length === 0 ? (
                                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                                    <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                        Nenhum serviço publicado ainda.
                                    </p>
                                    <p className="text-xs text-zinc-500 mb-4">
                                        Crie o seu primeiro serviço para começar a receber clientes em Moçambique.
                                    </p>
                                    <Link
                                        href="/dashboard/servicos"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Criar Serviço
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {services.slice(0, 5).map(service => (
                                        <div 
                                            key={service.id}
                                            className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                                                        {service.title}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        service.is_active 
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60' 
                                                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                                                    }`}>
                                                        {service.is_active ? 'Ativo' : 'Pausado'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                    {service.category?.name || 'Geral'} • {service.price ? `${Number(service.price).toLocaleString()} MT` : 'Preço sob consulta'}
                                                </p>
                                            </div>
                                            <Link 
                                                href={`/servicos/${service.id}`}
                                                className="text-xs font-semibold text-zinc-500 hover:text-orange-600 shrink-0"
                                            >
                                                Ver Público
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Contactos / Leads Recentes */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                Contactos Recebidos
                            </h2>

                            {loading ? (
                                <div className="p-8 text-center text-zinc-500">A carregar leads...</div>
                            ) : leads.length === 0 ? (
                                <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                    <PhoneCall className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                        Nenhum contacto recebido
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Quando um cliente clicar em "Contactar por WhatsApp", o registo de conversão aparecerá aqui.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leads.slice(0, 5).map(lead => (
                                        <div 
                                            key={lead.id}
                                            className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
                                        >
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                                    {lead.client_name || 'Cliente Direto'}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(lead.created_at).toLocaleDateString('pt-MZ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-emerald-600 font-medium">
                                                {lead.client_phone || 'WhatsApp Iniciado'}
                                            </p>
                                            {lead.service?.title && (
                                                <p className="text-[11px] text-zinc-500 truncate mt-1">
                                                    Interesse em: {lead.service.title}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
