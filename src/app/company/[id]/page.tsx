'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    Building2, 
    ShieldCheck, 
    MapPin, 
    Phone, 
    Mail, 
    Users, 
    Briefcase, 
    ArrowLeft,
    CheckCircle2,
    MessageCircle,
    Loader2
} from 'lucide-react';
import type { Company, Service } from '@nhonguista/sdk';

export default function PublicCompanyPage() {
    const params = useParams();
    const companyId = params?.id as string;

    const [company, setCompany] = useState<Company | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        async function loadCompany() {
            if (!companyId) return;
            try {
                setLoading(true);
                const data = await nhonguistaClient.companies.get(companyId);
                setCompany(data);

                // Carrega serviços associados à empresa
                const srvs = await nhonguistaClient.services.list({ company_id: companyId }).catch(() => []);
                setServices(srvs);
            } catch (err: any) {
                console.error('Erro ao carregar empresa:', err);
                setErrorMsg('Empresa não encontrada.');
            } finally {
                setLoading(false);
            }
        }

        loadCompany();
    }, [companyId]);

    const handleWhatsAppClick = (serviceId?: string) => {
        if (!company) return;
        const phoneNum = company.phone?.replace(/\D/g, '') || '';
        const msg = encodeURIComponent(`Olá equipa da ${company.name}, entrei em contacto pelo Nhonguista para solicitar um orçamento empresarial.`);
        window.open(`https://wa.me/${phoneNum}?text=${msg}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <p className="text-sm font-medium text-zinc-500">A carregar dados corporativos...</p>
            </div>
        );
    }

    if (errorMsg || !company) {
        return (
            <Container className="py-20 text-center">
                <div className="max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <Building2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Empresa Não Encontrada
                    </h2>
                    <p className="text-sm text-zinc-500 mb-6">
                        A organização solicitada não existe ou foi arquivada.
                    </p>
                    <Link
                        href="/servicos"
                        className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
                    >
                        Ver Todos os Serviços
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
            <Container>
                <Link 
                    href="/servicos"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 mb-6 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao catálogo
                </Link>

                {/* Perfil Corporativo */}
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-black text-2xl shrink-0">
                                <Building2 className="w-10 h-10" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        {company.name}
                                    </h1>
                                    {company.is_verified && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Empresa Verificada
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-2">
                                    {company.nuit && (
                                        <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                            NUIT: {company.nuit}
                                        </span>
                                    )}
                                    {company.address && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                                            {company.address}
                                        </span>
                                    )}
                                    {company.members && (
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                                            {company.members.length} colaboradores registados
                                        </span>
                                    )}
                                </div>

                                {company.description && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 max-w-2xl leading-relaxed">
                                        {company.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {company.phone && (
                            <button
                                onClick={() => handleWhatsAppClick()}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition self-stretch md:self-auto shrink-0"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Contactar Empresa
                            </button>
                        )}
                    </div>
                </div>

                {/* Serviços da Empresa */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Catálogo de Serviços da Empresa ({services.length})
                    </h2>

                    {services.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                            Nenhum serviço corporativo associado no momento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map(srv => (
                                <div 
                                    key={srv.id}
                                    className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-4 hover:border-orange-200 dark:hover:border-zinc-700 transition"
                                >
                                    <div>
                                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                                            {srv.title}
                                        </h3>
                                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                                            {srv.description}
                                        </p>
                                        <span className="text-xs font-bold text-orange-600 mt-2 block">
                                            {srv.price ? `${Number(srv.price).toLocaleString()} MT` : 'Preço sob consulta'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        <Link
                                            href={`/servicos/${srv.id}`}
                                            className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition"
                                        >
                                            Ver Detalhes
                                        </Link>
                                        <button
                                            onClick={() => handleWhatsAppClick(srv.id)}
                                            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
