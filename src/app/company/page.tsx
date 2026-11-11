'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    Building2, 
    Users, 
    Briefcase, 
    Plus, 
    ShieldCheck, 
    Trash2, 
    Loader2, 
    AlertCircle, 
    Check, 
    ArrowLeft,
    Phone,
    Mail,
    Globe
} from 'lucide-react';
import type { Company, Service, Category } from '@nhonguista/sdk';

export default function CompanyDashboardPage() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Create company modal/form state
    const [isCreating, setIsCreating] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [nuit, setNuit] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    
    // Add member state
    const [memberPhone, setMemberPhone] = useState('');
    const [memberRole, setMemberRole] = useState<'admin' | 'specialist'>('specialist');
    const [addingMember, setAddingMember] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const list = await nhonguistaClient.companies.list();
            setCompanies(list);
            if (list.length > 0) {
                // Seleciona a primeira empresa ou a previamente selecionada
                setSelectedCompany(prev => {
                    if (prev) {
                        const found = list.find((c: Company) => c.id === prev.id);
                        return found || list[0];
                    }
                    return list[0];
                });
            } else {
                setSelectedCompany(null);
            }
        } catch (err: any) {
            console.error('Erro ao listar empresas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!companyName.trim()) {
            setErrorMsg('Nome da empresa é obrigatório.');
            return;
        }

        try {
            setSubmitting(true);
            const newComp = await nhonguistaClient.companies.create({
                name: companyName.trim(),
                nuit: nuit.trim() || undefined,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                address: address.trim() || undefined,
                description: description.trim() || undefined,
            });

            setSuccessMsg(`Empresa "${newComp.name}" registada com sucesso!`);
            setIsCreating(false);
            setCompanyName('');
            setNuit('');
            setEmail('');
            setPhone('');
            setAddress('');
            setDescription('');
            await loadCompanies();
        } catch (err: any) {
            console.error('Erro ao registar empresa:', err);
            setErrorMsg(err.message || 'Falha ao criar registo da empresa.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!memberPhone.trim()) {
            setErrorMsg('Telefone do colaborador é obrigatório.');
            return;
        }

        try {
            setAddingMember(true);
            // Procura o id do utilizador ou adiciona por convite
            // No endpoint canónico da Missão 04.2: POST /companies/{company}/members { user_id, role }
            // Para simplificar a experiência, solicitamos o UUID ou contacto do colaborador
            await nhonguistaClient.companies.addMember(selectedCompany.id, {
                user_id: memberPhone.trim(),
                role: memberRole
            });

            setSuccessMsg('Membro adicionado com sucesso à organização.');
            setMemberPhone('');
            await loadCompanies();
        } catch (err: any) {
            console.error('Erro ao adicionar membro:', err);
            setErrorMsg(err.message || 'Falha ao adicionar membro à equipa.');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!selectedCompany) return;
        if (!confirm('Tem a certeza que deseja remover este membro da equipa?')) return;

        try {
            await nhonguistaClient.companies.removeMember(selectedCompany.id, memberId);
            await loadCompanies();
        } catch (err: any) {
            alert('Falha ao remover membro: ' + err.message);
        }
    };

    return (
        <ProtectedRoute requiredRole="provider">
            <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
                <Container>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link 
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 mb-2 transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
                            </Link>
                            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                Gestão Empresarial e Equipas
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Administre empresas, NUIT fiscal, equipas de colaboradores e ofertas corporativas.
                            </p>
                        </div>

                        {!isCreating && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-md shadow-orange-600/20 transition self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" /> Nova Empresa
                            </button>
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
                            <Check className="w-4 h-4 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Formulário de Criação de Empresa */}
                    {isCreating && (
                        <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                                    Registar Nova Empresa
                                </h3>
                                <button 
                                    onClick={() => setIsCreating(false)}
                                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <form onSubmit={handleCreateCompany} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Nome da Empresa / Razão Social *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            placeholder="Ex: ClimaTech Serviços Lda"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            NUIT Moçambicano
                                        </label>
                                        <input
                                            type="text"
                                            value={nuit}
                                            onChange={e => setNuit(e.target.value)}
                                            placeholder="Ex: 400123456"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Telefone Comercial / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="Ex: +258 84 000 0000"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Email de Contacto
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="contacto@empresa.co.mz"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Endereço da Sede
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="Ex: Av. 24 de Julho, Nº 1200, Maputo"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Descrição Corporativa
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Histórico, credenciais corporativas e setores de atuação..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 disabled:opacity-50 transition"
                                    >
                                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Criar Empresa
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                            <p className="text-xs text-zinc-500 font-medium">A carregar perfil empresarial...</p>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            <Building2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                                Nenhuma Empresa Associada
                            </h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                                Se atua como empresa ou sociedade comercial em Moçambique, crie a sua organização para gerir membros e serviços corporativos.
                            </p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
                            >
                                <Plus className="w-3.5 h-3.5" /> Criar Empresa
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Lista de Empresas do Utilizador */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">
                                    As Minhas Empresas ({companies.length})
                                </h3>

                                <div className="space-y-2">
                                    {companies.map(comp => (
                                        <button
                                            key={comp.id}
                                            onClick={() => setSelectedCompany(comp)}
                                            className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                                                selectedCompany?.id === comp.id
                                                    ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-500'
                                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                                            }`}
                                        >
                                            <div>
                                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                                                    {comp.name}
                                                </h4>
                                                <p className="text-xs text-zinc-500">
                                                    {comp.nuit ? `NUIT: ${comp.nuit}` : 'Sem NUIT'}
                                                </p>
                                            </div>
                                            {comp.is_verified && (
                                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Detalhes da Empresa Selecionada */}
                            {selectedCompany && (
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                                                        {selectedCompany.name}
                                                    </h2>
                                                    {selectedCompany.is_verified && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60">
                                                            Verificada
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {selectedCompany.address || 'Endereço não especificado'}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/company/${selectedCompany.id}`}
                                                className="text-xs font-bold text-orange-600 hover:text-orange-700"
                                            >
                                                Página Pública
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
                                            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                                <span className="text-zinc-400 font-bold block mb-1">NUIT</span>
                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedCompany.nuit || 'Pendente'}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                                <span className="text-zinc-400 font-bold block mb-1">Contacto</span>
                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedCompany.phone || 'Não atribuído'}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                                <span className="text-zinc-400 font-bold block mb-1">Email</span>
                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{selectedCompany.email || 'Não atribuído'}</span>
                                            </div>
                                        </div>

                                        {/* Gestão de Membros / Equipa */}
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-orange-600" /> Membros da Equipa
                                                </h3>
                                            </div>

                                            {/* Formulário para Adicionar Colaborador */}
                                            <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2 mb-4">
                                                <input
                                                    type="text"
                                                    required
                                                    value={memberPhone}
                                                    onChange={e => setMemberPhone(e.target.value)}
                                                    placeholder="UUID ou ID do Utilizador Colaborador"
                                                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                                />
                                                <select
                                                    value={memberRole}
                                                    onChange={e => setMemberRole(e.target.value as any)}
                                                    className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                                >
                                                    <option value="specialist">Especialista / Técnico</option>
                                                    <option value="admin">Administrador da Empresa</option>
                                                </select>
                                                <button
                                                    type="submit"
                                                    disabled={addingMember}
                                                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl hover:bg-zinc-800 transition disabled:opacity-50"
                                                >
                                                    {addingMember ? 'Adicionando...' : 'Adicionar'}
                                                </button>
                                            </form>

                                            {/* Lista de Membros */}
                                            <div className="space-y-2">
                                                {selectedCompany.members && selectedCompany.members.length > 0 ? (
                                                    selectedCompany.members.map(member => (
                                                        <div 
                                                            key={member.id}
                                                            className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-between text-xs"
                                                        >
                                                            <div>
                                                                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                                                    {member.user?.name || `Utilizador ${member.user_id.substring(0, 8)}...`}
                                                                </span>
                                                                <span className="ml-2 text-[10px] uppercase font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                                                                    {member.role}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveMember(member.id)}
                                                                className="text-zinc-400 hover:text-red-600 transition"
                                                                title="Remover Membro"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-zinc-500 py-3 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                                                        Nenhum colaborador adicionado além do titular.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Container>
            </div>
        </ProtectedRoute>
    );
}
