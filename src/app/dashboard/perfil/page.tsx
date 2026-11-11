'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { nhonguistaClient } from '@/lib/api';
import { Container } from '@nhonguista/ui';
import { 
    User, 
    ArrowLeft, 
    Loader2, 
    Check, 
    AlertCircle, 
    Phone, 
    MapPin, 
    FileText,
    Clock
} from 'lucide-react';
import type { Location } from '@nhonguista/sdk';

export default function ProviderProfilePage() {
    const { user, refreshUser } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [bio, setBio] = useState('');
    const [experienceYears, setExperienceYears] = useState('1');
    const [address, setAddress] = useState('');
    const [locationId, setLocationId] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState('08:00 - 18:00');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            try {
                const locs = await nhonguistaClient.locations.list();
                setLocations(locs);

                const profile = user?.provider_profile;
                if (profile) {
                    setBio(profile.bio || '');
                    setExperienceYears(String(profile.experience_years || 1));
                    setAddress(profile.address || '');
                    setLocationId(profile.location_id || (locs.length > 0 ? locs[0].id : ''));
                    setAvailabilityHours(profile.availability_hours || '08:00 - 18:00');
                }
            } catch (err: any) {
                console.error('Erro ao carregar dados do perfil:', err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            setSaving(true);
            await nhonguistaClient.providerProfile.update({
                bio: bio.trim(),
                experience_years: Number(experienceYears),
                address: address.trim(),
                location_id: locationId || undefined,
                availability_hours: availabilityHours.trim(),
            });

            await refreshUser();
            setSuccessMsg('Perfil profissional atualizado com sucesso!');
        } catch (err: any) {
            console.error('Erro ao atualizar perfil:', err);
            setErrorMsg(err.message || 'Falha ao gravar os dados do perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute requiredRole="provider">
            <div className="bg-zinc-50 dark:bg-black min-h-screen py-10">
                <Container className="max-w-2xl">
                    <Link 
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-orange-600 mb-4 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
                    </Link>

                    <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    Perfil Profissional
                                </h1>
                                <p className="text-xs text-zinc-500">
                                    Estas informações são apresentadas na sua página pública para clientes em Moçambique.
                                </p>
                            </div>
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

                        {loading ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                                <span className="text-xs text-zinc-500 font-medium">A carregar perfil...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Nome de Apresentação
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={user?.name || ''}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 text-sm cursor-not-allowed"
                                    />
                                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Vinculado à sua conta de utilizador principal.</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Contacto WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            disabled
                                            value={user?.phone || ''}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 text-sm cursor-not-allowed"
                                        />
                                        <span className="text-[11px] text-zinc-400 mt-0.5 block">Utilizado para conversões diretas de clientes.</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Anos de Experiência
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={experienceYears}
                                            onChange={e => setExperienceYears(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Cidade / Província
                                        </label>
                                        <select
                                            value={locationId}
                                            onChange={e => setLocationId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        >
                                            <option value="">Selecione a província...</option>
                                            {locations.map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.city} ({loc.province})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                            Horário de Atendimento
                                        </label>
                                        <input
                                            type="text"
                                            value={availabilityHours}
                                            onChange={e => setAvailabilityHours(e.target.value)}
                                            placeholder="Ex: Seg-Sáb: 08:00 - 18:00"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Endereço / Bairro
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="Ex: Bairro Central, Av. Eduardo Mondlane, Maputo"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                                        Biografia / Apresentação Resumida
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Explique a sua especialidade, qualificações e garantia de serviço aos clientes..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 disabled:opacity-50"
                                    >
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </Container>
            </div>
        </ProtectedRoute>
    );
}
