// pages/resultado.tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function Resultado() {
  const router = useRouter();
  const { resultado } = router.query; // Pega o parâmetro da URL
  const [dados, setDados] = useState<{ text: string; legislacoes: any[] } | null>(null);

  useEffect(() => {
    if (resultado) {
      try {
        const parsed = JSON.parse(decodeURIComponent(resultado as string));
        setDados(parsed);
      } catch (error) {
        console.error('Erro ao interpretar o resultado:', error);
      }
    }
  }, [resultado]);

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5] font-dm">
        Carregando resultado...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm p-8">
      <Head>
        <title>Resultado da Análise | Analys</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6 text-center">Resultado da Análise</h1>

      <div className="bg-white p-6 rounded shadow-md max-w-4xl mx-auto mb-10">
        <h2 className="text-xl font-semibold mb-4">Texto Extraído:</h2>
        <p className="whitespace-pre-wrap text-gray-700">{dados.text}</p>
      </div>

      <div className="bg-white p-6 rounded shadow-md max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Legislação Aplicada:</h2>
        <ul className="list-disc pl-6 text-gray-700">
          {dados.legislacoes.map((legis, index) => (
            <li key={index}>
              <strong>{legis.parametro}:</strong> {legis.valor} ({legis.baseLegal})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
