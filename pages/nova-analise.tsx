// pages/nova-analise.tsx

import { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Topo from '@/components/Topo';

export default function NovaAnalise() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cidade, setCidade] = useState('itauna');
  const [tipoProjeto, setTipoProjeto] = useState('simplificado');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      alert('Selecione um arquivo PDF ou imagem!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('cidade', cidade);
    formData.append('tipoProjeto', tipoProjeto);

    try {
      const response = await fetch('http://localhost:8000/inferir', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resultado = await response.json();
        router.push(`/resultado?id=${resultado.id}`);
      } else {
        console.error('Erro ao processar análise.');
        alert('Erro ao processar análise!');
      }
    } catch (error) {
      console.error('Erro no envio:', error);
      alert('Erro inesperado!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-dm p-4">
      <Head>
        <title>Nova Análise | Analys</title>
      </Head>

      <Topo />

      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-3xl font-bold mb-6">Nova Análise</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="itauna">Itaúna - MG</option>
          </select>

          <select
            value={tipoProjeto}
            onChange={(e) => setTipoProjeto(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="simplificado">Projeto Simplificado - PMI</option>
          </select>

          <input
            type="file"
            accept="application/pdf, image/jpeg, image/png"
            onChange={handleFileChange}
            className="border p-2 rounded"
            required
          />

          <button type="submit" className="bg-[var(--foreground)] text-[var(--background)] py-2 rounded hover:opacity-80" disabled={loading}>
            {loading ? (
              <span className="text-sm font-medium"> Analisando, por favor aguarde...</span>
            ) : (
              'Enviar para Análise'
            )}
          </button>
        </form>

        {loading && (
          <div className="w-full max-w-md mt-6">
            <div className="h-2 w-full bg-gray-300 rounded">
              <div className="h-2 bg-[var(--foreground)] rounded animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
