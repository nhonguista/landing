'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { nhonguistaClient, apiFetch } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    User, 
    ShieldCheck, 
    Star, 
    MapPin, 
    Phone, 
    Clock, 
    Briefcase, 
    ArrowLeft,
    CheckCircle2,
    MessageCircle,
    Loader2,
    Building2
} from 'lucide-react';
import type { ProviderProfile, Service, Review } from '@nhonguista/sdk';

export default function PublicProviderPage() {
    const params = useParams();
    const providerId = params?.id as string;

    const [provider, setProvider] = useState<ProviderProfile | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form review
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            if (!providerId) return;
            try {
                setLoading(true);
                const data = await nhonguistaClient.providerProfile.get(providerId);
                setProvider(data);

                // Carrega serviços públicos
                const allServices = await nhonguistaClient.services.list({ provider_profile_id: providerId }).catch(() => []);
                setServices(allServices);

                // Carrega avaliações
                const revs = await nhonguistaClient.reviews.list(providerId).catch(() => []);
                setReviews(revs);
            } catch (err: any) {
                console.error('Erro ao carregar prestador:', err);
                setErrorMsg('Não foi possível encontrar este perfil de prestador.');
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [providerId]);

    const handleWhatsAppClick = async (serviceId?: string) => {
        if (!provider) return;

        // Registo de Lead / Conversão comercial
        try {
            await nhonguistaClient.leads.create({
                provider_profile_id: provider.id,
                service_id: serviceId,
                client_name: 'Visitante Nhonguista',
                notes: 'Contacto iniciado via página pública de perfil'
            });
        } catch (e) {
            console.warn('Erro ao registar conversão de lead:', e);
        }

        const phoneNum = provider.user?.phone?.replace(/\D/g, '') || '';
        const msg = encodeURIComponent(`Olá ${provider.user?.name || ''}, vi o seu perfil no Nhonguista e gostaria de obter mais informações sobre os seus serviços.`);
        window.open(`https://wa.me/${phoneNum}?text=${msg}`, '_blank');
    };

    const handleSendReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!provider || !comment.trim() || !clientName.trim()) return;

        try {
            setSubmittingReview(true);
            await nhonguistaClient.reviews.create({
                provider_profile_id: provider.id,
                rating: Number(rating),
                client_name: clientName.trim(),
                client_phone: clientPhone.trim() || undefined,
                comment: comment.trim(),
            });

            setReviewSuccess(true);
            setClientName('');
            setClientPhone('');
            setComment('');
        } catch (err: any) {
            alert('Falha ao enviar avaliação: ' + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <p className="text-sm font-medium text-zinc-500">A carregar perfil do prestador...</p>
            </div>
        );
    }

    if (errorMsg || !provider) {
        return (
            <Container className="py-20 text-center">
                <div className="max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <User className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Prestador Não Encontrado
                    </h2>
                    <p className="text-sm text-zinc-500 mb-6">
                        O perfil que procura não está disponível ou foi desativado.
                    </p>
                    <Link
                        href="/prestadores"
                        className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
                    >
                        Ver Todos os Prestadores
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
            <Container>
                <Link 
                    href="/prestadores"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 mb-6 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista de prestadores
                </Link>

                {/* Perfil Principal */}
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-black text-2xl shrink-0">
                                {provider.user?.name?.substring(0, 2).toUpperCase() || 'PR'}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        {provider.user?.name}
                                    </h1>
                                    {provider.is_verified && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-2">
                                    {provider.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                                            {provider.location.city}, {provider.location.province}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                        {provider.availability_hours || 'Segunda a Sábado'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                                        {provider.experience_years || 1} anos de experiência
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                                        {Number(provider.rating_average || 5.0).toFixed(1)} ({provider.rating_count || 0} avaliações)
                                    </span>
                                </div>

                                {provider.bio && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 max-w-2xl leading-relaxed">
                                        {provider.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botão de Contacto WhatsApp */}
                        <button
                            onClick={() => handleWhatsAppClick()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition self-stretch md:self-auto shrink-0"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contactar no WhatsApp
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Serviços Disponíveis */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                            Serviços Oferecidos ({services.length})
                        </h2>

                        {services.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                                Este prestador não possui serviços ativos no momento.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {services.map(srv => (
                                    <div 
                                        key={srv.id}
                                        className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-200 dark:hover:border-zinc-700 transition"
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
                                        <div className="flex gap-2 shrink-0">
                                            <Link
                                                href={`/servicos/${srv.id}`}
                                                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition"
                                            >
                                                Detalhes
                                            </Link>
                                            <button
                                                onClick={() => handleWhatsAppClick(srv.id)}
                                                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" /> Pedir Orçamento
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Avaliações e Formulário de Feedback */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 mb-1">
                                Avaliações de Clientes
                            </h3>
                            <p className="text-xs text-zinc-500 mb-4">
                                Comentários verificados de utilizadores Nhonguista.
                            </p>

                            {reviews.length === 0 ? (
                                <p className="text-xs text-zinc-400 text-center py-4">
                                    Nenhuma avaliação pública ainda.
                                </p>
                            ) : (
                                <div className="space-y-3 mb-6">
                                    {reviews.map(rev => (
                                        <div key={rev.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs">
                                            <div className="flex items-center justify-between font-bold mb-1">
                                                <span>{rev.client_name}</span>
                                                <span className="text-amber-500">★ {rev.rating}</span>
                                            </div>
                                            <p className="text-zinc-600 dark:text-zinc-400 italic">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Enviar Avaliação */}
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                    Deixar Avaliação
                                </h4>

                                {reviewSuccess ? (
                                    <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200">
                                        Avaliação submetida! Será exibida após aprovação da moderação.
                                    </p>
                                ) : (
                                    <form onSubmit={handleSendReview} className="space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Seu Nome"
                                                value={clientName}
                                                onChange={e => setClientName(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Seu Contacto (opcional)"
                                                value={clientPhone}
                                                onChange={e => setClientPhone(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                            />
                                            <select
                                                value={rating}
                                                onChange={e => setRating(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600 font-bold"
                                            >
                                                <option value="5">★★★★★ (5/5)</option>
                                                <option value="4">★★★★☆ (4/5)</option>
                                                <option value="3">★★★☆☆ (3/5)</option>
                                                <option value="2">★★☆☆☆ (2/5)</option>
                                                <option value="1">★☆☆☆☆ (1/5)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <textarea
                                                rows={2}
                                                required
                                                placeholder="Descreva a sua experiência com este prestador..."
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-orange-600"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="w-full py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                                        >
                                            {submittingReview ? 'A enviar...' : 'Enviar Avaliação'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
