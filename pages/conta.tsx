import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';

export default function Conta() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
      } else {
        router.push('/login?callbackUrl=/conta');
      }
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center font-dm">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-dm relative">
      <Head>
        <title>Minha Conta | Analys</title>
      </Head>

      {/* Cabeçalho superior */}
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
      </nav>

      {/* Avatar no canto superior esquerdo */}
      <div className="absolute top-6 left-6">
        {usuario?.photoURL ? (
          <Image
            src={usuario.photoURL}
            alt="Avatar do Usuário"
            width={64}
            height={64}
            className="rounded-full object-cover cursor-pointer"
            onClick={() => setOpenMenu(!openMenu)}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white cursor-pointer"
            onClick={() => setOpenMenu(!openMenu)}
          >
            {usuario?.displayName?.substring(0, 2).toUpperCase() || "AN"}
          </div>
        )}
      </div>

      {/* Menu expandido (ao clicar no avatar) */}
      {openMenu && (
        <div className="absolute top-24 left-6 w-60 bg-white border rounded-lg shadow-lg p-4 text-center z-10">
          <p className="font-semibold mb-2">Plano: Gratuito</p>
          <p className="cursor-pointer hover:text-gray-700 mb-2">Pagamento</p>
          <p className="cursor-pointer hover:text-gray-700 mb-2">Dados do Escritório</p>
          <p className="cursor-pointer hover:text-gray-700 mb-2">Alterar Senha</p>
          <p className="cursor-pointer hover:text-gray-700 mb-2">Suporte</p>
          <button
            onClick={() => {
              signOut(auth).then(() => router.push('/login'));
            }}
            className="w-full bg-black text-white rounded-full py-2 mt-4 hover:bg-gray-800 transition"
          >
            Sair da Conta
          </button>
        </div>
      )}

      {/* Área principal */}
      <div className="flex flex-col items-center justify-start p-6">
        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => router.push('/guia')}
            className="px-6 py-3 bg-black text-white text-lg rounded-full hover:bg-gray-800 transition"
          >
            Guia Normativo
          </button>

          <button
            onClick={() => router.push('/nova-analise')}
            className="px-6 py-3 bg-black text-white text-lg rounded-full hover:bg-gray-800 transition"
          >
            Análise Gráfica
          </button>

          <button
            onClick={() => router.push('/fluxo')}
            className="px-6 py-3 bg-black text-white text-lg rounded-full hover:bg-gray-800 transition"
          >
            Fluxo
          </button>

          <button
            onClick={() => router.push('/resumo')}
            className="px-6 py-3 bg-black text-white text-lg rounded-full hover:bg-gray-800 transition"
          >
            Resumo
          </button>
        </div>

        {/* Texto principal */}
        <h1 className="text-2xl font-semibold mb-4">Minha Conta - Área do Usuário</h1>
        <p className="text-gray-600 text-center max-w-md">
          Em breve você poderá acompanhar seus projetos analisados e acessar relatórios completos.
        </p>
      </div>
    </div>
  );
}
