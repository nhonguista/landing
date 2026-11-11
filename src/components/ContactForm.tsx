"use client";

import { useState } from "react";
import { Button, Input, useToast } from "@nhonguista/ui";
import { isValidName, isValidMozambicanPhone } from "moz-utils";
import { apiFetch } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState({ name: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors = { name: "", phone: "", message: "" };
    let hasError = false;

    if (!formData.name) {
      newErrors.name = "O nome é obrigatório.";
      hasError = true;
    } else if (!isValidName(formData.name)) {
      newErrors.name = "Por favor, insira um nome válido (apenas letras).";
      hasError = true;
    }

    if (!formData.phone) {
      newErrors.phone = "O número de telefone é obrigatório.";
      hasError = true;
    } else if (!isValidMozambicanPhone(formData.phone)) {
      newErrors.phone = "Insira um número moçambicano válido (ex: 84XXXXXXX).";
      hasError = true;
    }

    if (!formData.message || formData.message.length < 10) {
      newErrors.message = "A mensagem deve ter pelo menos 10 caracteres.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submissão real para a API do backend
      await apiFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
        })
      });

      setIsSuccess(true);
      setFormData({ name: "", phone: "", message: "" });
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Recebemos o seu contacto. A nossa equipa responderá em breve.",
        variant: "success"
      });
    } catch (err: any) {
      console.error("Erro ao enviar contacto:", err);
      toast({
        title: "Erro ao enviar",
        description: err.message || "Não foi possível registar o seu contacto. Tente novamente ou use o WhatsApp.",
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-black p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center py-16">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Mensagem Recebida!</h3>
        <p className="text-zinc-500 max-w-md mx-auto mb-6 text-sm">
          Obrigado pelo seu contacto. A equipa do Nhonguista entrará em contacto pelo seu número de WhatsApp com brevidade.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-black p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Nome Completo
        </label>
        <Input 
          id="name"
          name="name" 
          placeholder="Ex: João Silva" 
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Telemóvel (Moçambique)
        </label>
        <Input 
          id="phone"
          name="phone" 
          placeholder="Ex: 841234567" 
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Mensagem
        </label>
        <textarea 
          id="message"
          name="message" 
          rows={4}
          placeholder="Como podemos ajudar? Descreva a sua dúvida ou necessidade..." 
          value={formData.message}
          onChange={handleChange}
          className={`w-full rounded-2xl border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 ${errors.message ? "border-red-500" : "border-zinc-200"}`}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Enviando...
          </>
        ) : (
          "Enviar Mensagem"
        )}
      </Button>
    </form>
  );
}
