import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import myimage from './myimage.jpg'; 
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      
 
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        Bem-vindo à DEISI Shop
      </h1>
      
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        Encontra os melhores produtos de tecnologia com a rapidez e segurança que mereces.
        Explora o nosso catálogo e aproveita as novidades!
      </p>

      {/* --- IMAGEM DE LANDING --- */}
  
      <div className="relative w-full max-w-4xl h-[300px] md:h-[500px] mb-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
        <Image 
          src={myimage} 
          alt="Imagem de destaque da loja"
          fill
          className="object-cover hover:scale-105 transition-transform duration-700"
          priority
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      
      <Link href="/produtos">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 px-12 rounded-full transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-blue-200">
          Começar as Compras 🛒
        </button>
      </Link>

    </div>
  );
}