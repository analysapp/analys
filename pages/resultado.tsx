// pages/resultado.tsx

import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect, useState } from 'react'

interface ResultadoAnalise {
  parametro: string
  conforme: boolean
  valorEncontrado?: string
  esperado?: string
  observacao?: string
}

export default function Resultado() {
  const router = useRouter()
  const [resultado, setResultado] = useState<ResultadoAnalise[] | null>(null)

  useEffect(() => {
    if (router.query.resultado) {
      try {
        const parsed = JSON.parse(router.query.resultado as string)
        setResultado(parsed.resultado)
      } catch (err) {
        console.error('Erro ao interpretar resultado:', err)
      }
    }
  }, [router.query.resultado])

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm p-8">
      <Head>
        <title>Resultado da Análise | Analys</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6 text-center">Resultado da Análise</h1>

      {!resultado ? (
        <p className="text-center text-gray-600">Carregando resultado...</p>
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
          {resultado.map((item, index) => (
            <div key={index} className="border-b border-gray-200 py-4">
              <h2 className="text-xl font-semibold">
                {item.parametro} -{' '}
                <span className={item.conforme ? 'text-green-600' : 'text-red-600'}>
                  {item.conforme ? 'Conforme' : 'Não conforme'}
                </span>
              </h2>
              {item.valorEncontrado && (
                <p><strong>Valor encontrado:</strong> {item.valorEncontrado}</p>
              )}
              {item.esperado && (
                <p><strong>Esperado:</strong> {item.esperado}</p>
              )}
              {item.observacao && (
                <p className="text-sm text-gray-500 mt-2">{item.observacao}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
