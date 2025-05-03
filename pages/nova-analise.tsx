// pages/nova-analise.tsx

import { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

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
      const response = await fetch('/api/analisar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resultado = await response.json();
        const resultadoEncoded = encodeURIComponent(JSON.stringify(resultado));
        router.push(`/resultado?resultado=${resultadoEncoded}`);
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
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm items-center justify-center p-4">
      <Head>
        <title>Nova Análise | Analys</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Nova Análise</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        {/* Selecionar Cidade */}
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="itauna">Itaúna - MG</option>
        </select>

        {/* Selecionar Tipo de Projeto */}
        <select
          value={tipoProjeto}
          onChange={(e) => setTipoProjeto(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="simplificado">Projeto Simplificado - PMI</option>
        </select>

        {/* Upload Arquivo */}
        <input
          type="file"
          accept="application/pdf, image/jpeg, image/png"
          onChange={handleFileChange}
          className="border p-2 rounded"
          required
        />

        {/* Botão */}
        <button type="submit" className="bg-black text-white py-2 rounded hover:bg-gray-800" disabled={loading}>
          {loading ? (
            <span className="animate-ping-slow text-3xl">.</span>
          ) : (
            'Enviar para Análise'
          )}
        </button>
      </form>

      {loading && (
        <div className="flex justify-center items-center min-h-[100px] mt-6">
          <div className="w-8 h-8 bg-black rounded-full animate-ping-slow"></div>
        </div>
      )}
    </div>
  );
}
