'use client'

import React, { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

import { Produto } from '@/models/interfaces';
import ProdutoDetalhe from '@/components/ProdutoDetalhe/ProdutoDetalhe';

// O fetcher continua a ser o mesmo de antes
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Interface para receber os parâmetros da rota
// Em Next.js 15+, params é uma Promise
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ProdutoPage({ params }: PageProps) {
    // 1. Desembrulhar a Promise dos parâmetros usando React.use()
    // Isto é obrigatório no Next.js 15 para Client Components
    const { id } = use(params);

    // 2. Usar o ID para fazer o fetch ao endpoint específico (/products/{id})
    // O tipo genérico agora é <Produto>
    const { data: produto, error, isLoading } = useSWR<Produto>(
        `https://deisishop.pythonanywhere.com/products/${id}`, 
        fetcher
    );

    // Tratamento de Erro
    if (error) return (
        <div className="flex justify-center items-center min-h-screen text-red-600 font-bold">
            Erro ao carregar o produto.
        </div>
    );

    // Tratamento de Loading
    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600">A carregar detalhes...</p>
        </div>
    );

    // Renderização
    return (
        <main className="container mx-auto p-6 min-h-screen bg-gray-50/50">
            {/* Botão Voltar */}
            <div className="mb-6">
                <Link 
                    href="/produtos" 
                    className="inline-flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar à Lista
                </Link>
            </div>

            {/* Injeção do Componente de Detalhes se o produto existir */}
            {produto ? (
                <ProdutoDetalhe produto={produto} />
            ) : (
                <div className="text-center text-gray-500">Produto não encontrado.</div>
            )}
        </main>
    );
}