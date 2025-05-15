import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect, useState } from 'react'

export default function Resultado() {
  const router = useRouter()
  const { id } = router.query
  const [dados, setDados] = useState<any | null>(null)

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/resultado/${id}`)
        .then(res => res.json())
        .then(data => setDados(data))
        .catch(err => console.error('Erro ao buscar resultado:', err))
    }
  }, [id])

  const analise = dados?.analise?.quadro_permeabilidade_dados

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm text-[var(--foreground)] p-8">
      <Head>
        <title>Resultado da Análise | Analys</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6 text-center">Resultado da Análise</h1>

      {!analise ? (
        <p className="text-center text-gray-600">Carregando resultado...</p>
      ) : (
        <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded shadow-md space-y-4 text-base text-gray-800 dark:text-gray-200">
          <p><strong>Área do terreno:</strong> {analise.area_terreno ?? 'Não identificado'}</p>
          <p><strong>Área permeável total:</strong> {analise.area_permeavel_total ?? 'Não identificado'}</p>
          <p><strong>Taxa de permeabilidade:</strong> {analise.percentual_total ?? 'Não identificado'}</p>
          <p><strong>% de grama sobre a permeável:</strong> {analise.percentual_grama ?? 'Não identificado'}</p>
          <p>
            <strong>Status:</strong>{" "}
            {analise.conforme === true ? (
              <span className="text-green-600 font-medium">Conforme</span>
            ) : (
              <span className="text-red-600 font-medium">Não conforme</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
