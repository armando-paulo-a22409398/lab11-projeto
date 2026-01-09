'use client'

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { Produto } from '@/models/interfaces';
import ProdutoCard from '@/components/ProdutoCard/ProdutoCard';
// 1. Importar o Hook do Contexto
import { useCart } from '@/context/CartContext'; 

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProdutosPage() {
    // Buscar produtos à API
    const { data, error, isLoading } = useSWR<Produto[]>('https://deisishop.pythonanywhere.com/products', fetcher);
    
    // 2. USAR O ESTADO GLOBAL (Isto resolve o teu problema!)
    // Em vez de useState local, lemos diretamente do Cérebro da App
    const { cart, addToCart, removeFromCart, totalCost, buy } = useCart();

    // Estados locais (apenas para filtros e UI, estes podem reiniciar sem problema)
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [filteredData, setFilteredData] = useState<Produto[]>([]);
    
    // Estados do Checkout
    const [isStudent, setIsStudent] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [purchaseMessage, setPurchaseMessage] = useState('');

    // Efeito para Filtros e Ordenação
    useEffect(() => {
        if (!data) return;
        let newFilteredData = [...data];

        // Filtrar
        if (search) {
            newFilteredData = newFilteredData.filter(produto =>
                produto.title.toLowerCase().includes(search.toLowerCase()) ||
                produto.category.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Ordenar
        if (sort === 'az') newFilteredData.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === 'za') newFilteredData.sort((a, b) => b.title.localeCompare(a.title));
        else if (sort === 'priceAsc') newFilteredData.sort((a, b) => a.price - b.price);
        else if (sort === 'priceDesc') newFilteredData.sort((a, b) => b.price - a.price);

        setFilteredData(newFilteredData);
    }, [data, search, sort]);

    const handleBuy = async () => {
        try {
            const result = await buy(isStudent, coupon);
            setPurchaseMessage(`Sucesso! Ref: ${result.reference}, Total: ${result.totalCost}€`);
        } catch (error: any) {
            setPurchaseMessage(`Erro: ${error.message}`);
        }
    };

    if (error) return <div className="text-red-500 font-bold p-10 text-center">Erro ao carregar os produtos.</div>;
    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600 font-medium">A carregar catálogo...</p>
        </div>
    );

    return (
        <main className="container mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Loja Online</h1>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* --- LISTA DE PRODUTOS --- */}
                <div className="flex-grow w-full space-y-6">
                    
                    {/* Barra de Filtros */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 sticky top-4 z-10 backdrop-blur-md bg-white/90">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Pesquisar produtos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full md:w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">Ordenar por...</option>
                            <option value="az">Nome (A-Z)</option>
                            <option value="za">Nome (Z-A)</option>
                            <option value="priceAsc">Preço (Crescente)</option>
                            <option value="priceDesc">Preço (Decrescente)</option>
                        </select>
                    </div>

                    {/* Grid de Produtos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map((produto) => (
                            <div key={produto.id} className="h-full">
                                <ProdutoCard 
                                    produto={produto} 
                                    onAddToCart={() => addToCart(produto)} // Função global
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SIDEBAR CARRINHO (Sincronizado com Contexto) --- */}
                <aside className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                🛒 Carrinho
                            </h2>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                {/* O reduce agora lê do Contexto, que persiste entre páginas */}
                                {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
                            </span>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
                            {cart.length === 0 ? (
                                <p className="text-gray-400 text-center py-8 text-sm">O seu carrinho está vazio.</p>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.product.id} className="flex gap-3 items-center bg-gray-50 p-2 rounded-lg group">
                                        <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded border border-gray-200 p-1">
                                            <Image 
                                                src={'https://deisishop.pythonanywhere.com' + item.product.image} 
                                                alt={item.product.title}
                                                fill
                                                className="object-contain"
                                                sizes="48px"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{item.product.title}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} x {Number(item.product.price).toFixed(2)}€</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => addToCart(item.product)} className="text-green-600 hover:bg-green-100 p-0.5 rounded">+</button>
                                            <button onClick={() => removeFromCart(item.product.id)} className="text-red-600 hover:bg-red-100 p-0.5 rounded">-</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>{totalCost.toFixed(2)} €</span>
                            </div>
                            
                            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} className="rounded text-blue-600" />
                                <span>Sou Estudante</span>
                            </label>
                            
                            <input type="text" placeholder="Cupão" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm" />

                            <button onClick={handleBuy} disabled={cart.length === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                Comprar Agora
                            </button>

                            {purchaseMessage && (
                                <div className={`p-3 rounded-lg text-sm font-medium border ${purchaseMessage.startsWith('Sucesso') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {purchaseMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}