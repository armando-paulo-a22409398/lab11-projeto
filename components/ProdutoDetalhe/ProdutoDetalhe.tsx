'use client'

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Produto } from '@/models/interfaces';
import { useState } from 'react';
interface ProdutoDetalheProps {
    produto: Produto;
}

export default function ProdutoDetalhe({ produto }: ProdutoDetalheProps) {
    const router = useRouter();
    const imagePrefix = 'https://deisishop.pythonanywhere.com';
    
    // Verificação de segurança para a imagem
    const imageUrl = produto?.image && produto.image.startsWith('http') 
        ? produto.image 
        : imagePrefix + (produto?.image || '');

    // Função para adicionar ao carrinho (via localStorage)
    const handleAddToCart = (redirect: boolean = false) => {
        // Validação básica antes de prosseguir
        if (!produto || !produto.id) {
            alert("Erro: Dados do produto inválidos.");
            return;
        }

        try {
            const savedCart = localStorage.getItem('cart');
            let cart = savedCart ? JSON.parse(savedCart) : [];

            // Garantir que cart é um array
            if (!Array.isArray(cart)) cart = [];

            // Migração de estrutura antiga para nova
            if (cart.length > 0 && typeof cart[0] === 'object' && !('quantity' in cart[0])) {
                cart = cart.map((p: any) => ({ product: p, quantity: 1 }));
            }

            // Verificar se já existe
            const existingIndex = cart.findIndex((item: any) => item?.product?.id === produto.id);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({ product: produto, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            
            if (redirect) {
                router.push('/produtos'); // Redireciona para o checkout
            } else {
                alert('Produto adicionado ao carrinho com sucesso!');
            }
        } catch (error) {
            console.error("Erro ao adicionar:", error);
            alert("Erro ao processar o carrinho.");
        }
    };

    // Se o produto não existir, não renderiza nada (previne erros de undefined)
    if (!produto) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gray-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={imageUrl}
                            alt={produto.title || "Produto"}
                            fill
                            className="object-contain mix-blend-multiply"
                            priority
                        />
                    </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
                        {produto.category || "Geral"}
                    </span>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {produto.title}
                    </h1>

                    {produto.rating && (
                        <div className="flex items-center mb-6 bg-yellow-50 w-fit px-3 py-1 rounded-full border border-yellow-100">
                            <span className="text-yellow-500 mr-1 text-lg">★</span>
                            <span className="font-bold text-gray-700 mr-1">{produto.rating.rate}</span>
                            <span className="text-gray-400 text-sm">({produto.rating.count} avaliações)</span>
                        </div>
                    )}

                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        {produto.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-4xl font-bold text-gray-900">
                            {Number(produto.price || 0).toFixed(2)} €
                        </span>
                        

                    </div>
                </div>
            </div>
        </div>
    );
}