'use client'

import React from 'react'; // Não precisamos de useState/useEffect aqui
import Link from 'next/link';
import { useCart } from '@/context/CartContext'; // USAR O HOOK DO CONTEXTO

export default function Header() {
    // Ler diretamente do cérebro da app
    const { cart } = useCart();

    // Calcular total
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

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