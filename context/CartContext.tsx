'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Produto } from '@/models/interfaces';

interface CartItem {
    product: Produto;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (produto: Produto) => void;
    removeFromCart: (produtoId: number) => void;
    totalCost: number;
    buy: (isStudent: boolean, coupon: string) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    const normalized = parsed.map(item => 
                        'quantity' in item ? item : { product: item, quantity: 1 }
                    );
                    setCart(normalized);
                }
            } catch (error) {
                console.error("Erro ao carregar carrinho:", error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (produto: Produto) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === produto.id);
            if (existing) {
                return prev.map(item => 
                    item.product.id === produto.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prev, { product: produto, quantity: 1 }];
        });
    };

    const removeFromCart = (produtoId: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === produtoId);
            if (existing && existing.quantity > 1) {
                return prev.map(item => 
                    item.product.id === produtoId 
                        ? { ...item, quantity: item.quantity - 1 } 
                        : item
                );
            }
            return prev.filter(item => item.product.id !== produtoId);
        });
    };

    const totalCost = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const buy = async (isStudent: boolean, coupon: string) => {
        // --- CORREÇÃO AQUI ---
        // Usamos flatMap para criar um array onde o ID aparece X vezes (consoante a quantidade)
        const productsToSend = cart.flatMap(item => 
            Array(item.quantity).fill(item.product.id)
        );
        // Exemplo: Se tiveres 2 T-shirts (id 1) e 1 Caneca (id 5)
        // Antes enviava: [1, 5]
        // Agora envia:   [1, 1, 5]

        const response = await fetch('https://deisishop.pythonanywhere.com/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                products: productsToSend, // Enviamos o array corrigido
                student: isStudent,
                coupon: coupon,
                name: "User Context"
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro na compra');
        }

        const result = await response.json();
        
        // Espião (Opcional, podes remover depois)
        console.log("RESPOSTA DA API:", result);

        setCart([]); 
        return result;
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalCost, buy }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
}