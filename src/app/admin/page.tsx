'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { nhonguistaClient, apiFetch } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    ShieldCheck, 
    Star, 
    CheckCircle2, 
    XCircle, 
    CreditCard, 
    Users, 
    Briefcase, 
    FileText,
    ArrowUpRight,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import type { Verification, Review, Plan, Subscription } from '@nhonguista/sdk';

export default function AdminDashboardPage() {
    const { token } = useAuth();
    const [pendingVerifications, setPendingVerifications] = useState<Verification[]>([]);
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Subscription activation form
    const [subUserId, setSubUserId] = useState('');
    const [subPlanId, setSubPlanId] = useState('');
    const [subReference, setSubReference] = useState('');
    const [activatingSub, setActivatingSub] = useState(false);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [verifs, revs, planList, statsData] = await Promise.all([
                apiFetch<Verification[]>('/admin/verifications/pending', { token: token || undefined }).catch(() => []),
                apiFetch<Review[]>('/admin/reviews/pending', { token: token || undefined }).catch(() => []),
                nhonguistaClient.plans.list().catch(() => []),
                apiFetch('/stats').catch(() => null)
            ]);

            setPendingVerifications(verifs);
            setPendingReviews(revs);
            setPlans(planList);
            setStats(statsData);
            if (planList.length > 0 && !subPlanId) {
                const paidPlan = planList.find(p => Number(p.price) > 0) || planList[0];
                setSubPlanId(paidPlan.id);
            }
        } catch (err: any) {
            console.error('Erro ao carregar dados do admin:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, [token]);

    const handleModerateVerification = async (id: string, action: 'approved' | 'rejected') => {
        try {
            setActionLoading(id);
            setFeedbackMsg(null);
            const reason = action === 'rejected' ? prompt('Indique o motivo da rejeição:') : undefined;
            if (action === 'rejected' && !reason) {
                setActionLoading(null);
                return;
            }

            await nhonguistaClient.verifications.moderate(id, action, reason || undefined);
            setFeedbackMsg({ 
                type: 'success', 
                text: `Verificação ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!` 
            });
            await loadAdminData();
        } catch (err: any) {
            setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao moderar documento.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleModerateReview = async (id: string, action: 'approved' | 'rejected') => {
        try {
            setActionLoading(id);
            setFeedbackMsg(null);
            await nhonguistaClient.reviews.moderate(id, action);
            setFeedbackMsg({ 
                type: 'success', 
                text: `Avaliação ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!` 
            });
            await loadAdminData();
        } catch (err: any) {
            setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao moderar avaliação.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivateSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackMsg(null);

        if (!subUserId.trim() || !subPlanId) {
            setFeedbackMsg({ type: 'error', text: 'Preencha o ID do utilizador e selecione o plano.' });
            return;
        }

        try {
            setActivatingSub(true);
            await nhonguistaClient.plans.activateManual({
                user_id: subUserId.trim(),
                plan_id: subPlanId,
                payment_reference: subReference.trim() || `MPESA-${Date.now()}`
            });

            setFeedbackMsg({ type: 'success', text: 'Subscrição ativada com sucesso para o utilizador!' });
            setSubUserId('');
            setSubReference('');
        } catch (err: any) {
            setFeedbackMsg({ type: 'error', text: err.message || 'Falha ao ativar subscrição.' });
        } finally {
            setActivatingSub(false);
        }
    };

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
                <Container>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                                    Painel de Controlo da Plataforma
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                Administração Nhonguista
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                Modere documentação, avaliações públicas e ative pagamentos de subscrições.
                            </p>
                        </div>
                    </div>

                    {feedbackMsg && (
                        <div className={`mb-6 p-4 rounded-xl border text-xs flex items-center gap-2 ${
                            feedbackMsg.type === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-600'
                                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600'
                        }`}>
                            {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            <span>{feedbackMsg.text}</span>
                        </div>
                    )}

                    {/* Visão Geral da Plataforma */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Verificações Pendentes</span>
                            <div className="text-3xl font-black text-orange-600">{pendingVerifications.length}</div>
                            <p className="text-xs text-zinc-400 mt-1">Documentos a aguardar auditoria</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Avaliações Pendentes</span>
                            <div className="text-3xl font-black text-amber-500">{pendingReviews.length}</div>
                            <p className="text-xs text-zinc-400 mt-1">Moderação de qualidade de serviço</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Total de Serviços</span>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stats?.total_services ?? '...'}</div>
                            <p className="text-xs text-zinc-400 mt-1">Catálogo ativo nacional</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Total de Prestadores</span>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stats?.total_providers ?? '...'}</div>
                            <p className="text-xs text-zinc-400 mt-1">Profissionais registados</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Fila de Verificação de Documentos */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                Auditoria de Documentação ({pendingVerifications.length})
                            </h2>
                            <p className="text-xs text-zinc-500 mb-4">
                                Aprove ou rejeite pedidos de selo de confiança para prestadores.
                            </p>

                            {pendingVerifications.length === 0 ? (
                                <div className="py-10 text-center text-xs text-zinc-400 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
                                    Nenhum documento pendente de aprovação.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingVerifications.map(ver => (
                                        <div key={ver.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{ver.document_type}</span>
                                                <span className="font-mono text-zinc-500">{ver.document_number}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mb-3">
                                                ID Prestador: <span className="font-mono">{ver.provider_profile_id}</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleModerateVerification(ver.id, 'approved')}
                                                    disabled={actionLoading === ver.id}
                                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                                                >
                                                    Aprovar Selo
                                                </button>
                                                <button
                                                    onClick={() => handleModerateVerification(ver.id, 'rejected')}
                                                    disabled={actionLoading === ver.id}
                                                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
                                                >
                                                    Rejeitar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Moderação de Avaliações */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" />
                                Moderação de Avaliações ({pendingReviews.length})
                            </h2>
                            <p className="text-xs text-zinc-500 mb-4">
                                As avaliações só aparecem na plataforma pública após validação da equipa.
                            </p>

                            {pendingReviews.length === 0 ? (
                                <div className="py-10 text-center text-xs text-zinc-400 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
                                    Nenhuma avaliação a aguardar moderação.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingReviews.map(rev => (
                                        <div key={rev.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{rev.client_name}</span>
                                                <span className="font-bold text-amber-500 flex items-center gap-1">
                                                    ★ {rev.rating} / 5
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 italic">
                                                "{rev.comment}"
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleModerateReview(rev.id, 'approved')}
                                                    disabled={actionLoading === rev.id}
                                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                                                >
                                                    Aprovar Avaliação
                                                </button>
                                                <button
                                                    onClick={() => handleModerateReview(rev.id, 'rejected')}
                                                    disabled={actionLoading === rev.id}
                                                    className="flex-1 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-lg transition"
                                                >
                                                    Rejeitar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ativação Manual de Subscrição (Pagamentos Locais: M-Pesa / E-Mola) */}
                    <div className="mt-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            Ativação Manual de Subscrições Comerciais
                        </h2>
                        <p className="text-xs text-zinc-500 mb-6">
                            Permite registar o pagamento manual via M-Pesa, E-Mola ou transferência bancária e ativar o plano correspondente ao prestador.
                        </p>

                        <form onSubmit={handleActivateSubscription} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                    UUID do Utilizador / Prestador *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={subUserId}
                                    onChange={e => setSubUserId(e.target.value)}
                                    placeholder="UUID do prestador"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                    Plano a Ativar *
                                </label>
                                <select
                                    value={subPlanId}
                                    onChange={e => setSubPlanId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {Number(p.price) > 0 ? `${Number(p.price)} MT / mês` : 'Grátis'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                    Ref. Pagamento (Ex: M-Pesa ID)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={subReference}
                                        onChange={e => setSubReference(e.target.value)}
                                        placeholder="Ex: MP8928372"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                    />
                                    <button
                                        type="submit"
                                        disabled={activatingSub}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shrink-0 disabled:opacity-50"
                                    >
                                        {activatingSub ? 'Ativando...' : 'Ativar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
