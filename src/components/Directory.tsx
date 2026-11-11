"use client";

import { useState, useEffect } from "react";
import { nhonguistaClient, apiFetch } from "@/lib/api";
import { 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  Container,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button
} from "@nhonguista/ui";
import { Search, SlidersHorizontal, MessageCircle, MapPin, Briefcase, Star, Loader2 } from "lucide-react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price_min: string;
  price_type: string;
  images?: string[];
  user?: { id: string; name: string; avatar: string | null; phone: string };
  category?: { name: string; slug: string };
  location?: { name: string };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export function Directory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias reais da API
  useEffect(() => {
    nhonguistaClient.categories.list()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  // Carregar serviços reais da API com busca e filtro
  useEffect(() => {
    setIsLoading(true);
    const queryParams: Record<string, string> = { per_page: '24' };
    if (selectedCategory !== "todas") {
      queryParams.category = selectedCategory;
    }
    if (searchTerm.trim()) {
      queryParams.search = searchTerm.trim();
    }

    const query = new URLSearchParams(queryParams).toString();
    apiFetch(`/services?${query}`)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setServices(list);
        setError(null);
      })
      .catch((err) => {
        console.error("Erro ao consultar prestadores:", err);
        setError("Não foi possível carregar a lista de prestadores no momento.");
        setServices([]);
      })
      .finally(() => setIsLoading(false));
  }, [searchTerm, selectedCategory]);

  return (
    <section id="diretorio" className="py-24 bg-white dark:bg-black">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Directório de Prestadores
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Encontre e contacte directamente profissionais verificados em Nampula.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center max-w-4xl mx-auto w-full bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input 
                placeholder="Pesquisar por especialidade ou serviço..." 
                className="pl-12 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-brand/20 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[280px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-brand/20">
                  <div className="flex items-center gap-2 px-2 text-base">
                    <SlidersHorizontal className="h-5 w-5 text-zinc-400" />
                    <SelectValue placeholder="Categoria" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-6 text-center max-w-3xl mx-auto w-full rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-72 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map((service) => {
                  const phone = service.user?.phone ? service.user.phone.replace(/\D/g, '') : '';
                  const finalPhone = phone.startsWith('258') ? phone : `258${phone}`;
                  const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(`Olá ${service.user?.name || ''}, vi o seu perfil no Nhonguista para o serviço "${service.title}".`)}`;

                  return (
                    <Card key={service.id} className="flex flex-col h-full overflow-hidden border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all rounded-3xl">
                      <CardHeader className="flex flex-row items-start gap-4 pb-4">
                        <Avatar className="h-14 w-14 border border-zinc-200 dark:border-zinc-800">
                          <AvatarImage src={service.user?.avatar || undefined} />
                          <AvatarFallback className="bg-brand/10 text-brand font-bold">
                            {service.user?.name ? service.user.name.slice(0, 2).toUpperCase() : "NH"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 gap-1">
                          <h3 className="font-bold text-lg line-clamp-1">{service.user?.name || service.title}</h3>
                          <Badge variant="secondary" className="w-fit text-xs bg-zinc-100 dark:bg-zinc-800">
                            {service.category?.name || "Geral"}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 pb-4">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">
                          {service.title}
                        </h4>
                        <p className="text-sm text-zinc-500 line-clamp-3">
                          {service.description}
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-xs text-zinc-400">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{service.location?.name || "Nampula"}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 flex flex-col gap-3">
                        <div className="w-full flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
                          <span className="text-zinc-400">Preço:</span>
                          <span className="font-bold text-brand">
                            {service.price_min ? `${Number(service.price_min).toLocaleString()} MT` : "Sob Consulta"}
                          </span>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" asChild className="rounded-xl w-full">
                            <Link href={`/servicos/${service.id}`}>Ver Perfil</Link>
                          </Button>
                          <Button size="sm" asChild className="rounded-xl w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Briefcase className="h-12 w-12 text-zinc-400 stroke-1 mb-3" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Nenhum prestador encontrado</h3>
                <p className="text-sm text-zinc-500 max-w-sm mt-1">
                  Não encontramos profissionais cadastrados para os filtros selecionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
