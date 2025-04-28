// pages/nova-analise.tsx

import { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function NovaAnalise() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cidade, setCidade] = useState('');            // 👈 NOVO campo
  const [tipoProjeto, setTipoProjeto] = useState('');   // 👈 NOVO campo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      alert('Selecione um arquivo PDF!');
      return;
    }

    if (!session) {
      alert('Você precisa estar logado!');
      return;
    }

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', String(session.user?.id || 1));
    formData.append('cidade', cidade);          // 👈 envia cidade
    formData.append('tipoProjeto', tipoProjeto); // 👈 envia tipo de projeto

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Projeto enviado com sucesso!');
        router.push('/conta'); // redirecionar para a conta depois de enviar
      } else {
        alert('Erro ao enviar projeto!');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro inesperado!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm items-center justify-center p-4">
      <Head>
        <title>Nova Análise | Analys</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Nova Análise</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        
        {/* Campo Cidade */}
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="border p-2 rounded"
          required
        >
          <option value="">Selecione a Cidade</option>
          <option value="itauna">Itaúna - MG</option>
          <option value="divinopolis">Divinópolis - MG</option>
        </select>

        {/* Campo Tipo de Projeto */}
        <select
          value={tipoProjeto}
          onChange={(e) => setTipoProjeto(e.target.value)}
          className="border p-2 rounded"
          required
        >
          <option value="">Selecione o Tipo de Projeto</option>
          <option value="projeto-arquitetonico">Projeto Arquitetônico</option>
          <option value="acessibilidade">Acessibilidade</option>
          <option value="ampliacao">Ampliação</option>
        </select>

        {/* Campo Título */}
        <input
          type="text"
          placeholder="Título do Projeto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />

        {/* Campo Descrição */}
        <textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded h-24"
        />

        {/* Upload PDF */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
          className="border p-2 rounded"
          required
        />

        <button type="submit" className="bg-black text-white py-2 rounded hover:bg-gray-800">
          Enviar Projeto
        </button>
      </form>
    </div>
  );
}
