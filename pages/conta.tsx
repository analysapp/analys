// pages/conta.tsx

import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Conta() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/conta');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center font-dm">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm">
      <Head>
        <title>Minha Conta | Analys</title>
      </Head>

      {/* Cabeçalho superior */}
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
        {!session && <Link href="/login">login</Link>}
      </nav>

      {/* Área principal */}
      <div className="flex flex-col items-center justify-start p-6">

        {/* Avatar */}
        <div className="relative mb-6">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="Avatar do Usuário"
              width={64}
              height={64}
              className="rounded-full border-2 border-black object-cover cursor-pointer"
              onClick={() => setOpenMenu(!openMenu)}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white border-2 border-black cursor-pointer"
              onClick={() => setOpenMenu(!openMenu)}
            >
              {session?.user?.name?.substring(0, 2).toUpperCase() || "AN"}
            </div>
          )}
        </div>

        {/* Menu expandido (ao clicar no avatar) */}
        {openMenu && (
          <div className="w-60 bg-white border rounded-lg shadow-lg p-4 mb-8 text-center">
            <p className="font-semibold mb-2">Plano: Gratuito</p>
            <p className="cursor-pointer hover:text-gray-700 mb-2">Pagamento</p>
            <p className="cursor-pointer hover:text-gray-700 mb-2">Dados do Escritório</p>
            <p className="cursor-pointer hover:text-gray-700 mb-2">Alterar Senha</p>
            <p className="cursor-pointer hover:text-gray-700 mb-2">Suporte</p>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full bg-black text-white rounded-full py-2 mt-4 hover:bg-gray-800 transition"
            >
              Sair da Conta
            </button>
          </div>
        )}

        {/* Botão Nova Análise */}
        <button
          onClick={() => router.push('/nova-analise')}
          className="px-8 py-3 bg-black text-white text-lg rounded-full hover:bg-gray-800 transition mb-8"
        >
          Nova Análise
        </button>

        {/* Texto principal */}
        <h1 className="text-2xl font-semibold mb-4">Minha Conta - Área do Usuário</h1>
        <p className="text-gray-600 text-center max-w-md">
          Em breve você poderá acompanhar seus projetos analisados e acessar relatórios completos.
        </p>

      </div>
    </div>
  );
}
