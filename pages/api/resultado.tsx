import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Topo from '@/components/Topo'

export default function Resultado() {
  const router = useRouter();
  const { id } = router.query;

  const [dados, setDados] = useState<any | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/resultado/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao buscar resultado");
          return res.json();
        })
        .then((data) => {
          console.log("✅ Resultado carregado:", data);
          setDados(data);
        })
        .catch((err) => {
          console.error("❌ Erro ao carregar resultado:", err);
          setErro(true);
        });
    }
  }, [id]);

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] font-dm text-red-600">
        Erro ao carregar resultado.
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] font-dm">
        Carregando resultado...
      </div>
    );
  }

  const quadro = dados?.analise?.quadro_permeabilidade_dados;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-dm">
      <Head>
        <title>Resultado da Análise | Analys</title>
      </Head>

      <Topo />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Resultado da Análise</h1>

        {quadro ? (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quadro de Permeabilidade</h2>
            <ul className="space-y-2 text-gray-800 dark:text-gray-200">
              <li><strong>Área do terreno:</strong> {quadro.area_terreno ?? 'não identificado'} m²</li>
              <li><strong>Área permeável:</strong> {quadro.area_permeavel ?? 'não identificado'} m²</li>
              <li><strong>Percentual de permeabilidade:</strong> {quadro.percentual ? `${quadro.percentual}%` : 'não identificado'}</li>
              <li>
                <strong>Status:</strong>{" "}
                {quadro.conforme === true
                  ? <span className="text-green-600 font-medium">Conforme</span>
                  : quadro.conforme === false
                  ? <span className="text-red-600 font-medium">Não conforme</span>
                  : <span className="text-yellow-600 font-medium">Indefinido</span>}
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-red-600 text-center">Nenhuma informação de permeabilidade detectada.</p>
        )}
      </div>
    </div>
  );
}
