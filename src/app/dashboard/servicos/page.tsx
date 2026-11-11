'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    Briefcase, 
    Plus, 
    Trash2, 
    Power, 
    Loader2, 
    AlertCircle, 
    ArrowLeft,
    Check,
    Image as ImageIcon
} from 'lucide-react';
import type { Service, Category, Location } from '@nhonguista/sdk';

export default function ServicesManagementPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [price, setPrice] = useState('');
    const [priceUnit, setPriceUnit] = useState('fixo');

    const loadData = async () => {
        try {
            setLoading(true);
            const [myServices, catList, locList] = await Promise.all([
                nhonguistaClient.services.mine(),
                nhonguistaClient.categories.list(),
                nhonguistaClient.locations.list()
            ]);
            setServices(myServices);
            setCategories(catList);
            setLocations(locList);
            if (catList.length > 0 && !categoryId) setCategoryId(catList[0].id);
            if (locList.length > 0 && !locationId) setLocationId(locList[0].id);
        } catch (err: any) {
            console.error('Erro ao carregar dados dos serviços:', err);
            setErrorMsg('Não foi possível carregar o catálogo de serviços.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!title.trim() || !description.trim() || !categoryId) {
            setErrorMsg('Por favor preencha os campos obrigatórios (título, categoria e descrição).');
            return;
        }

        try {
            setSubmitting(true);
            await nhonguistaClient.services.create({
                title: title.trim(),
                description: description.trim(),
                category_id: categoryId,
                location_id: locationId || undefined,
                price: price ? Number(price) : undefined,
                price_unit: priceUnit || undefined,
            });

            setSuccessMsg('Serviço criado com sucesso no catálogo!');
            setTitle('');
            setDescription('');
            setPrice('');
            setIsCreating(false);
            await loadData();
        } catch (err: any) {
            console.error('Erro ao criar serviço:', err);
            setErrorMsg(err.message || 'Falha ao registar serviço. Verifique os limites do seu plano.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (service: Service) => {
        try {
            await nhonguistaClient.services.toggleActive(service.id);
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s));
        } catch (err: any) {
            alert('Não foi possível alterar o estado do serviço: ' + err.message);
        }
    };

    const handleDelete = async (serviceId: string) => {
        if (!confirm('Tem a certeza que deseja remover este serviço?')) return;

        try {
            await nhonguistaClient.services.delete(serviceId);
            setServices(prev => prev.filter(s => s.id !== serviceId));
        } catch (err: any) {
            alert('Falha ao remover o serviço: ' + err.message);
        }
    };

    return (
        <ProtectedRoute requiredRole="provider">
            <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
                <Container>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <Link 
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 mb-2 transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
                            </Link>
                            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                Gestão dos Meus Serviços
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Crie, edite e controle a visibilidade das suas ofertas no ecossistema Nhonguista.
                            </p>
                        </div>

                        {!isCreating && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-md shadow-orange-600/20 transition"
                            >
                                <Plus className="w-4 h-4" /> Novo Serviço
                            </button>
                        )}
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
                            <Check className="w-5 h-5 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Formulário de Criação Rápida */}
                    {isCreating && (
                        <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                                    Adicionar Novo Serviço
                                </h3>
                                <button 
                                    onClick={() => setIsCreating(false)}
                                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <form onSubmit={handleCreateService} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Título do Serviço *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="Ex: Instalação e Reparação de Ar Condicionado"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Categoria *
                                        </label>
                                        <select
                                            value={categoryId}
                                            onChange={e => setCategoryId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Localização
                                        </label>
                                        <select
                                            value={locationId}
                                            onChange={e => setLocationId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        >
                                            <option value="">Moçambique (Todas as regiões)</option>
                                            {locations.map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.city} ({loc.province})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Preço Base (MT)
                                        </label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            placeholder="Ex: 1500"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Unidade de Cobrança
                                        </label>
                                        <select
                                            value={priceUnit}
                                            onChange={e => setPriceUnit(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        >
                                            <option value="fixo">Preço Fixo</option>
                                            <option value="hora">Por Hora</option>
                                            <option value="dia">Por Dia</option>
                                            <option value="visita">Por Visita Técnica</option>
                                            <option value="sob_consulta">Sob Consulta</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Descrição do Serviço *
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Descreva o que está incluído, prazos médios e garantias oferecidas..."
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
                                        Guardar e Publicar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Lista de Serviços Cadastrados */}
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                            <p className="text-sm text-zinc-500 font-medium">A carregar serviços...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            <Briefcase className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                                Nenhum serviço registado
                            </h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                                Comece a oferecer os seus serviços no Nhonguista para clientes encontrarem o seu trabalho em Moçambique.
                            </p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
                            >
                                <Plus className="w-3.5 h-3.5" /> Criar Primeiro Serviço
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {services.map(service => (
                                <div 
                                    key={service.id}
                                    className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-orange-200 dark:hover:border-zinc-700 transition"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                                                {service.title}
                                            </h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                service.is_active 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60' 
                                                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                                            }`}>
                                                {service.is_active ? 'Ativo' : 'Pausado'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2 max-w-2xl">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                                            <span>{service.category?.name || 'Geral'}</span>
                                            <span>•</span>
                                            <span className="font-bold text-orange-600">
                                                {service.price ? `${Number(service.price).toLocaleString()} MT (${service.price_unit})` : 'Preço sob consulta'}
                                            </span>
                                            {service.location && (
                                                <>
                                                    <span>•</span>
                                                    <span>{service.location.city}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                                        <button
                                            onClick={() => handleToggleActive(service)}
                                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                                                service.is_active 
                                                    ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' 
                                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                                            }`}
                                            title={service.is_active ? 'Pausar Serviço' : 'Ativar Serviço'}
                                        >
                                            <Power className="w-4 h-4" />
                                            {service.is_active ? 'Pausar' : 'Ativar'}
                                        </button>
                                        
                                        <Link
                                            href={`/servicos/${service.id}`}
                                            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition"
                                        >
                                            Ver Página
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                            title="Eliminar Serviço"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Container>
            </div>
        </ProtectedRoute>
    );
}
