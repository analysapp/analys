// pages/admin.tsx

import Head from 'next/head';
import { useState } from 'react';

export default function Admin() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const cities = [
    { state: 'MG', name: 'Itaúna' },
    { state: 'MG', name: 'Belo Horizonte' },
    { state: 'SP', name: 'São Paulo' },
    { state: 'RJ', name: 'Rio de Janeiro' },
  ];

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm">
      <Head>
        <title>Administração | Analys</title>
      </Head>

      {/* Menu Superior */}
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light">
        <a href="/">home</a>
        <a href="/sobre">sobre</a>
        <a href="/servicos">serviços</a>
        <a href="/contato">contato</a>
        <a href="/conta">minha conta</a>
      </nav>

      {/* Conteúdo */}
      <div className="p-8">
        {/* Logo e Nome */}
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-black">analys</h1>
        </div>

        {/* Caixa de Busca */}
        <div className="flex gap-4 items-center mb-8">
          <input
            type="text"
            placeholder="Buscar cidade"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full max-w-md"
          />
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Adicionar Cidade
          </button>
        </div>

        {/* Listagem de Cidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((city, index) => (
              <div
                key={index}
                className={`p-4 border rounded cursor-pointer ${selectedCity === city.name ? 'bg-gray-200' : 'bg-white'}`}
                onClick={() => setSelectedCity(city.name)}
              >
                <h2 className="text-lg font-semibold">{city.name} - {city.state}</h2>
              </div>
            ))}
        </div>

        {/* Ações de Legislação */}
        {selectedCity && (
          <div className="mt-8 flex gap-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Adicionar Legislação
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              Editar Legislação
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Deletar Legislação
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
