'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    ShieldCheck, 
    ArrowLeft, 
    UploadCloud, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Loader2,
    FileCheck
} from 'lucide-react';
import type { Verification } from '@nhonguista/sdk';

export default function VerificationPage() {
    const { user, refreshUser } = useAuth();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [docType, setDocType] = useState('bi');
    const [docNumber, setDocNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const loadVerifications = async () => {
        try {
            setLoading(true);
            const list = await nhonguistaClient.verifications.mine();
            setVerifications(list);
        } catch (err: any) {
            console.error('Erro ao carregar verificações:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVerifications();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!docNumber.trim()) {
            setErrorMsg('Por favor insira o número do documento de identificação.');
            return;
        }

        try {
            setSubmitting(true);
            await nhonguistaClient.verifications.submit({
                document_type: docType,
                document_number: docNumber.trim(),
                document_url: 'https://storage.nhonguista.co.mz/docs/placeholder.pdf',
                notes: notes.trim() || undefined,
            });

            setSuccessMsg('Documentação submetida com sucesso para auditoria da equipa Nhonguista!');
            setDocNumber('');
            setNotes('');
            await loadVerifications();
            await refreshUser();
        } catch (err: any) {
            console.error('Erro ao submeter documento:', err);
            setErrorMsg(err.message || 'Falha ao submeter verificação.');
        } finally {
            setSubmitting(false);
        }
    };

    const isVerified = user?.provider_profile?.is_verified;

    return (
        <ProtectedRoute requiredRole="provider">
            <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
                <Container className="max-w-3xl">
                    <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 mb-4 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
                    </Link>

                    {/* Banner de Estado de Verificação */}
                    <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                isVerified 
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60' 
                                    : 'bg-orange-100 text-orange-600 dark:bg-orange-950/60'
                            }`}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                        Estado da Conta: {isVerified ? 'Prestador Verificado' : 'Não Verificado'}
                                    </h2>
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {isVerified 
                                        ? 'O seu selo de confiança está ativo e visível na pesquisa pública de Moçambique.'
                                        : 'Envie um documento oficial (B.I., DIRE, Passaporte ou Alvará) para desbloquear o selo de confiança.'}
                                </p>
                            </div>
                        </div>

                        {isVerified && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs self-start sm:self-auto">
                                <CheckCircle2 className="w-4 h-4" /> Selo Ativo
                            </div>
                        )}
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Formulário de Submissão */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 mb-1">
                                Submeter Documentação
                            </h3>
                            <p className="text-xs text-zinc-500 mb-4">
                                Os seus documentos são mantidos sob estrito sigilo comercial e utilizados apenas para autenticação.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Tipo de Documento
                                    </label>
                                    <select
                                        value={docType}
                                        onChange={e => setDocType(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    >
                                        <option value="bi">Bilhete de Identidade (B.I. Moçambicano)</option>
                                        <option value="dire">D.I.R.E. (Estrangeiros Residentes)</option>
                                        <option value="passaporte">Passaporte</option>
                                        <option value="nuit_certidao">NUIT / Certidão Comercial</option>
                                        <option value="alvara">Alvará de Prestação de Serviços</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Número do Documento *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={docNumber}
                                        onChange={e => setDocNumber(e.target.value)}
                                        placeholder="Ex: 110100234567M"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Observações / Validade
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Data de validade, órgão emissor ou detalhes adicionais..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Submeter para Auditoria
                                </button>
                            </form>
                        </div>

                        {/* Histórico de Submissões */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                                Histórico de Verificações
                            </h3>

                            {loading ? (
                                <div className="p-8 text-center text-zinc-500 text-xs">A carregar auditorias...</div>
                            ) : verifications.length === 0 ? (
                                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                    <FileCheck className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                        Nenhum pedido de verificação enviado.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {verifications.map(ver => (
                                        <div 
                                            key={ver.id}
                                            className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
                                        >
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                                                    {ver.document_type}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    ver.status === 'approved' 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60' 
                                                        : ver.status === 'rejected'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                                                }`}>
                                                    {ver.status === 'approved' ? 'Aprovado' : ver.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-mono">
                                                Doc: {ver.document_number}
                                            </p>
                                            {ver.rejection_reason && (
                                                <p className="text-xs text-red-600 mt-2 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                                                    Motivo da rejeição: {ver.rejection_reason}
                                                </p>
                                            )}
                                            <span className="text-[10px] text-zinc-400 mt-2 block">
                                                Submetido em: {new Date(ver.created_at).toLocaleDateString('pt-MZ')}
                                            </span>
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
