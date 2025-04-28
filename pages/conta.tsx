// pages/conta.tsx

import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Conta() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/conta')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center font-dm">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm">
      <Head>
        <title>Minha Conta | Analys</title>
      </Head>

      {/* Menu Superior */}
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
        {!session && <Link href="/login">login</Link>}
      </nav>

      {/* Conteúdo principal - 2 colunas */}
      <div className="flex flex-row h-[90vh]">
        {/* Coluna Lado Esquerdo */}
        <div className="w-1/4 bg-white flex flex-col items-center p-6 shadow-md">

          {/* Avatar */}
          <div className="relative">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar do Usuário"
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
                onClick={() => setOpenMenu(!openMenu)}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl text-white cursor-pointer"
                onClick={() => setOpenMenu(!openMenu)}
              >
                {session?.user?.name?.substring(0, 2).toUpperCase() || "AN"}
              </div>
            )}
          </div>

          {/* Menu expandido ao clicar */}
          {openMenu && (
            <div className="mt-4 w-48 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm">
              <p className="mb-2 font-semibold">Plano: Gratuito</p>
              <p className="mb-2 cursor-pointer hover:text-gray-700">Pagamento</p>
              <p className="mb-2 cursor-pointer hover:text-gray-700">Dados do Escritório</p>
              <p className="mb-2 cursor-pointer hover:text-gray-700">Alterar Senha</p>
              <p className="mb-2 cursor-pointer hover:text-gray-700">Suporte</p>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="mt-4 w-full bg-black text-white rounded-full py-2 hover:bg-gray-800 transition"
              >
                Sair da Conta
              </button>
            </div>
          )}

          {/* Menu lateral abaixo do avatar */}
          <div className="mt-10 flex flex-col gap-6 w-full">
            <Link href="#" className="text-black hover:text-gray-700 text-lg text-center">Projetos Analisados</Link>
            <Link href="#" className="text-black hover:text-gray-700 text-lg text-center">Relatórios</Link>
          </div>

        </div>

        {/* Coluna Lado Direito (Conteúdo da conta) */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Botão Nova Análise */}
          <button
            onClick={() => router.push('/nova-analise')}
            className="px-6 py-3 bg-black text-white text-lg rounded-full hover:bg-gray-800 transition mb-8"
          >
            nova análise
          </button>

          {/* Texto abaixo */}
          <h1 className="text-2xl font-semibold text-black">Minha Conta - Área do Usuário</h1>
          <p className="mt-4 text-gray-600 text-center max-w-md">
            Em breve, você poderá acompanhar seus projetos analisados e acessar seus relatórios.
          </p>
        </div>
      </div>
    </div>
  )
}
