'use client'

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Produto } from '@/models/interfaces';
import ProdutoCard from '@/components/ProdutoCard/ProdutoCard';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Nova interface para itens do carrinho com quantidade
interface CartItem {
    product: Produto;
    quantity: number;
}

export default function ProdutosPage() {
    const { data, error, isLoading } = useSWR<Produto[]>(
        'https://deisishop.pythonanywhere.com/products', 
        fetcher
    );

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [filteredData, setFilteredData] = useState<Produto[]>([]);
    
    // O carrinho agora guarda CartItem[] (produto + quantidade)
    const [cart, setCart] = useState<CartItem[]>([]);

    // Estados para o Checkout
    const [isStudent, setIsStudent] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [purchaseMessage, setPurchaseMessage] = useState('');

    // Carregar carrinho
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Migração: Se o carrinho antigo era array de produtos, converter para CartItem
                if (Array.isArray(parsed)) {
                    if (parsed.length > 0 && !parsed[0].quantity) {
                        const migrated = parsed.map((p: Produto) => ({ product: p, quantity: 1 }));
                        setCart(migrated);
                    } else {
                        setCart(parsed);
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar carrinho", e);
            }
        }
    }, []);

    // Guardar carrinho
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Filtragem e Ordenação
    useEffect(() => {
        if (data) {
            let result = data.filter(produto => 
                produto.title.toLowerCase().includes(search.toLowerCase())
            );

            if (sort === 'price-asc') {
                result.sort((a, b) => a.price - b.price);
            } else if (sort === 'price-desc') {
                result.sort((a, b) => b.price - a.price);
            } else if (sort === 'name-asc') {
                result.sort((a, b) => a.title.localeCompare(b.title));
            } else if (sort === 'name-desc') {
                result.sort((a, b) => b.title.localeCompare(a.title));
            }

            setFilteredData(result);
        }
    }, [search, sort, data]);

    // Adicionar produto (incrementa quantidade se já existir)
    const addToCart = (produto: Produto) => {
        setCart((prevCart) => {
            const existing = prevCart.find(item => item.product.id === produto.id);
            if (existing) {
                return prevCart.map(item => 
                    item.product.id === produto.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product: produto, quantity: 1 }];
        });
    };

    // Remover produto completamente
    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
    };

    // Atualizar quantidade (+/-)
    const updateQuantity = (productId: number, delta: number) => {
        setCart((prevCart) => prevCart.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    // Função de Compra
    const handleBuy = async () => {
        try {
            const response = await fetch('https://deisishop.pythonanywhere.com/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Envia IDs repetidos conforme a quantidade (ex: 2 t-shirts = envia ID 2 vezes)
                    products: cart.flatMap(item => Array(item.quantity).fill(item.product.id)),
                    student: isStudent,
                    coupon: coupon
                })
            });

            const result = await response.json();

            if (response.ok) {
                setPurchaseMessage(`Sucesso! Referência: ${result.reference} | Total: ${result.totalCost}€`);
                setCart([]); 
                localStorage.setItem('cart', '[]');
            } else {
                setPurchaseMessage(`Erro: ${result.error}`);
            }

        } catch (error) {
            console.error("Erro na compra:", error);
            setPurchaseMessage("Ocorreu um erro ao comunicar com o servidor.");
        }
    };

    // CORREÇÃO DO ERRO: Garantir que preço e quantidade são números
    const totalCost = cart.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);

    if (error) return <div>Erro ao carregar</div>;
    if (isLoading) return <div>A carregar...</div>;

    return (
        <main className="container mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">DEISI Shop</h1>
            <p className="text-center text-gray-500 mb-8">Os melhores produtos tecnológicos ao teu alcance.</p>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Coluna da Loja */}
                <div className="flex-grow">
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="">Sem ordenação</option>
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="price-asc">Preço (Crescente)</option>
                            <option value="price-desc">Preço (Decrescente)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredData.map((produto) => (
                            <ProdutoCard 
                                key={produto.id} 
                                produto={produto} 
                                onAddToCart={addToCart} 
                            />
                        ))}
                    </div>
                </div>

                {/* Coluna do Carrinho (Sidebar Atualizada com Quantidades) */}
                <aside className="lg:w-96 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
                        
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">O carrinho está vazio.</p>
                        ) : (
                            <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto mb-4 custom-scrollbar pr-2">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {/* Imagem */}
                                        <div className="relative w-16 h-16 bg-white rounded-md border border-gray-200 flex-shrink-0">
                                            <Image 
                                                src={item.product.image.startsWith('http') ? item.product.image : 'https://deisishop.pythonanywhere.com' + item.product.image}
                                                alt={item.product.title}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>

                                        {/* Info e Controlos */}
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-sm text-gray-800 truncate" title={item.product.title}>
                                                {item.product.title}
                                            </p>
                                            <p className="text-blue-600 font-bold text-sm">
                                                {Number(item.product.price).toFixed(2)} €
                                            </p>
                                            
                                            {/* Controlos de Quantidade */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold text-xs transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold text-xs transition-colors"
                                                >
                                                    +
                                                </button>
                                                
                                                <button 
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="ml-auto text-xs text-red-500 hover:text-red-700 underline"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="student"
                                    checked={isStudent}
                                    onChange={(e) => setIsStudent(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor="student" className="text-gray-700 font-medium cursor-pointer select-none">
                                    Sou Estudante DEISI
                                </label>
                            </div>

                            <input 
                                type="text" 
                                placeholder="Cupão de desconto"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                <span>Total</span>
                                {/* CORREÇÃO: totalCost agora é garantidamente um número */}
                                <span>{totalCost.toFixed(2)} €</span>
                            </div>
                            
                            <button 
                                onClick={handleBuy}
                                disabled={cart.length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                            >
                                Comprar Agora
                            </button>

                            {purchaseMessage && (
                                <div className={`mt-4 p-3 rounded-lg text-sm font-medium border ${purchaseMessage.startsWith('Sucesso') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
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