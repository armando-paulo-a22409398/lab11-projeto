'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
    const [totalItems, setTotalItems] = useState(0);

    // Função que vai ao LocalStorage contar os itens
    const updateCount = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cart = JSON.parse(savedCart);
            // Se for array simples ou com quantidades, adaptamos
            const count = Array.isArray(cart) ? cart.reduce((acc: number, item: any) => {
                return acc + (item.quantity || 1);
            }, 0) : 0;
            setTotalItems(count);
        } else {
            setTotalItems(0);
        }
    };

    useEffect(() => {
        // 1. Atualiza logo ao iniciar
        updateCount();

        // 2. Cria um "Ouvido" para escutar quando o carrinho muda
        const handleStorageChange = () => {
            updateCount();
        };

        // Adicionamos o evento 'cart-updated' 
        window.addEventListener('cart-updated', handleStorageChange);

        // Limpeza 
        return () => {
            window.removeEventListener('cart-updated', handleStorageChange);
        };
    }, []);

    return (
        <header className="flex flex-col gap-4 items-center w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-800">React ❤️ Next.js</h1>
            
            <nav className="flex justify-between w-full bg-white p-4 rounded-xl shadow-sm">
                <div className="flex gap-6">
                    <Link href="/" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Intro
                    </Link>
                    <Link href="/produtos" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Produtos
                    </Link>
                </div>

                <div className="flex items-center gap-2 font-bold text-blue-600">
                    <span>🛒 Carrinho</span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded-full text-sm">
                        {totalItems}
                    </span>
                </div>
            </nav>
        </header>
    );
}