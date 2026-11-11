'use client';

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User as UserIcon, Menu, X, LayoutDashboard, Building2, ShieldCheck } from "lucide-react";
import { 
    Button, 
    Container, 
    Avatar, 
    AvatarFallback
} from "@nhonguista/ui";

export function Header() {
    const { user, logout, isAuthenticated, isProvider, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 flex items-center justify-center px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900">
            <Container className="flex items-center justify-between px-0 sm:px-0 lg:px-0">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-transform">
                            N
                        </div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                            Nhonguista
                        </div>
                    </Link>
                </div>
            
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    <Link href="/servicos" className="hover:text-orange-600 transition-colors">Serviços</Link>
                    <Link href="/prestadores" className="hover:text-orange-600 transition-colors">Prestadores</Link>
                    <Link href="/#como-funciona" className="hover:text-orange-600 transition-colors">Como Funciona</Link>
                    <Link href="/contacto" className="hover:text-orange-600 transition-colors">Contacto</Link>
                    
                    {/* Painéis baseados no perfil */}
                    {isAuthenticated && (
                        <div className="flex items-center gap-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                            {(isProvider || isAdmin) && (
                                <Link 
                                    href="/dashboard" 
                                    className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Painel Prestador
                                </Link>
                            )}
                            {(isProvider || isAdmin) && (
                                <Link 
                                    href="/company" 
                                    className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                                >
                                    <Building2 className="w-4 h-4" />
                                    Empresa
                                </Link>
                            )}
                            {isAdmin && (
                                <Link 
                                    href="/admin" 
                                    className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-bold"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Admin
                                </Link>
                            )}
                        </div>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {/* Desktop Auth/User Area */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end mr-1">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</span>
                                    <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest">
                                        {user?.roles?.[0]?.name || (isAdmin ? 'Admin' : isProvider ? 'Prestador' : 'Cliente')}
                                    </span>
                                </div>
                                <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-800">
                                    <AvatarFallback className="bg-orange-600/10 text-orange-600 font-bold">
                                        {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                    </AvatarFallback>
                                </Avatar>
                                <button 
                                    onClick={logout}
                                    className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="Sair"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Entrar</Link>
                                </Button>
                                <Button size="sm" asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                                    <Link href="/registo">Criar Conta</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </Container>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 shadow-xl md:hidden">
                    <Link 
                        href="/servicos" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-semibold text-zinc-700 dark:text-zinc-300 py-2 border-b border-zinc-100 dark:border-zinc-800"
                    >
                        Serviços
                    </Link>
                    <Link 
                        href="/prestadores" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-semibold text-zinc-700 dark:text-zinc-300 py-2 border-b border-zinc-100 dark:border-zinc-800"
                    >
                        Prestadores
                    </Link>
                    <Link 
                        href="/#como-funciona" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-semibold text-zinc-700 dark:text-zinc-300 py-2 border-b border-zinc-100 dark:border-zinc-800"
                    >
                        Como Funciona
                    </Link>
                    <Link 
                        href="/contacto" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-semibold text-zinc-700 dark:text-zinc-300 py-2 border-b border-zinc-100 dark:border-zinc-800"
                    >
                        Contacto
                    </Link>

                    {isAuthenticated && (
                        <div className="py-2 flex flex-col gap-2 border-b border-zinc-100 dark:border-zinc-800">
                            {(isProvider || isAdmin) && (
                                <Link 
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-orange-600 font-bold py-1 flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Painel do Prestador
                                </Link>
                            )}
                            {(isProvider || isAdmin) && (
                                <Link 
                                    href="/company"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-zinc-700 dark:text-zinc-300 font-semibold py-1 flex items-center gap-2"
                                >
                                    <Building2 className="w-4 h-4" />
                                    Empresa
                                </Link>
                            )}
                            {isAdmin && (
                                <Link 
                                    href="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-purple-600 font-bold py-1 flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Painel de Administração
                                </Link>
                            )}
                        </div>
                    )}

                    {isAuthenticated ? (
                        <div className="pt-2 flex items-center justify-between">
                            <span className="text-sm font-bold">{user?.name}</span>
                            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-red-600 font-bold">
                                Sair
                            </button>
                        </div>
                    ) : (
                        <div className="pt-2 grid grid-cols-2 gap-3">
                            <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                                <Link href="/login">Entrar</Link>
                            </Button>
                            <Button asChild className="bg-orange-600 text-white" onClick={() => setMobileMenuOpen(false)}>
                                <Link href="/registo">Criar Conta</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
