'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
    Star, MapPin, ArrowLeft, MessageCircle, 
    ShieldCheck, Calendar, Info, Loader2, Briefcase 
} from 'lucide-react';

interface Service {
    id: string;
    title: string;
    description: string;
    price_min: string;
    price_max: string;
    price_type: string;
    images?: string[];
    user?: { id: string; name: string; avatar: string | null; phone: string };
    category?: { name: string };
    location?: { name: string };
    reviews?: any[];
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [isContacting, setIsContacting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    const { isAuthenticated, token } = useAuth();

    useEffect(() => {
        apiFetch(`/services/${id}`)
            .then((data: any) => {
                if (data?.data) {
                    setService(data.data);
                } else if (data && data.id) {
                    setService(data);
                } else {
                    setService(null);
                }
            })
            .catch((err: any) => {
                console.error('Erro ao buscar detalhes do serviço:', err);
                setError('Serviço não encontrado ou indisponível.');
                setService(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleContact = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/servicos/${id}`);
            return;
        }

        if (!service || !service.user) return;

        setIsContacting(true);
        try {
            // Register contact in DB
            await apiFetch('/contacts', {
                method: 'POST',
                token: token!,
                body: JSON.stringify({
                    service_id: service.id,
                    provider_id: service.user.id,
                    message: `Olá ${service.user.name}, vi o seu serviço "${service.title}" no Nhonguista e gostaria de saber mais.`
                })
            });

            // Redirect to WhatsApp
            const phone = service.user.phone || '';
            const cleanPhone = phone.replace(/\D/g, '');
            const finalPhone = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
            const whatsappMessage = encodeURIComponent(`Olá ${service.user.name}, vi o seu serviço "${service.title}" no Nhonguista e gostaria de saber mais.`);
            window.open(`https://wa.me/${finalPhone}?text=${whatsappMessage}`, '_blank');
        } catch (err) {
            console.error('Erro ao registar contacto:', err);
            if (service.user.phone) {
                const phone = service.user.phone.replace(/\D/g, '');
                const finalPhone = phone.startsWith('258') ? phone : `258${phone}`;
                window.open(`https://wa.me/${finalPhone}`, '_blank');
            }
        } finally {
            setIsContacting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                <span className="text-sm text-zinc-500">Carregando detalhes do serviço...</span>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <Briefcase className="w-16 h-16 text-zinc-400 stroke-1 mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Serviço não encontrado</h2>
                <p className="text-zinc-500 max-w-md mb-6">{error || 'O serviço solicitado não existe ou pode ter sido removido.'}</p>
                <Link 
                    href="/servicos" 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar aos Serviços
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            <header className="px-6 py-4 bg-white dark:bg-black border-b border-zinc-100 dark:border-zinc-900 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/servicos" className="flex items-center gap-2 text-zinc-500 hover:text-orange-600 font-bold">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                    </Link>
                    <div className="text-sm font-black uppercase tracking-widest text-orange-600">
                        {service.category?.name || 'Geral'}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    {/* Image Gallery */}
                    <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-8 shadow-2xl">
                        {service.images && service.images[0] ? (
                            <img 
                                src={service.images[0]} 
                                alt={service.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Briefcase className="w-16 h-16 opacity-30" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
                        {service.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
                        <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <Star className="w-5 h-5 fill-current" />
                            5.0
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500">
                            <MapPin className="w-5 h-5" />
                            {service.location?.name || 'Nampula'}, Moçambique
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-12">
                        <h3 className="text-xl font-bold mb-4">Sobre este serviço</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                            {service.description || 'Nenhuma descrição fornecida pelo profissional.'}
                        </p>
                    </div>

                    {/* Quality Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                        <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Verificado</h4>
                                <p className="text-sm text-zinc-500">Identidade e referências confirmadas pela nossa equipa.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Disponibilidade</h4>
                                <p className="text-sm text-zinc-500">Horário flexível e atendimento rápido.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / CTA */}
                <div>
                    <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl sticky top-28">
                        <div className="mb-6">
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">Preço estimado</span>
                            <div className="text-3xl font-black text-orange-600">
                                {service.price_min ? `${Number(service.price_min).toLocaleString()} MT` : 'Sob Consulta'}
                            </div>
                            <span className="text-xs text-zinc-500">
                                {service.price_type === 'hora' ? 'Por hora de serviço' : service.price_type === 'fixo' ? 'Preço fixo' : 'Negociável com o prestador'}
                            </span>
                        </div>

                        {service.user && (
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl mb-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold text-lg">
                                    {service.user.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 truncate">{service.user.name}</h4>
                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                                        Prestador Ativo
                                    </span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleContact}
                            disabled={isContacting}
                            className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-orange-600/20 disabled:opacity-50"
                        >
                            {isContacting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <MessageCircle className="w-5 h-5" />
                                    Contactar Prestador
                                </>
                            )}
                        </button>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 text-xs">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>O Nhonguista facilita a conexão inicial. Todos os detalhes e pagamentos devem ser combinados com o prestador.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
