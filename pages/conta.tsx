import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const ReactFlowNoSSR = dynamic(() => import('@/components/FluxogramaConta'), {
  ssr: false,
});

export default function Conta() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [etapas, setEtapas] = useState<string[]>([]);

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

  const toggleEtapa = (id: string) => {
    setEtapas((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

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

      {/* TOPO - NAVEGAÇÃO */}
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
      </nav>

      {/* AVATAR DO USUÁRIO */}
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

      {/* MENU LATERAL */}
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

      {/* FLUXOGRAMA SEMPRE VISÍVEL */}
      <div className="w-full h-[calc(100vh-100px)] px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full border rounded-xl shadow overflow-hidden"
        >
          <ReactFlowNoSSR />
        </motion.div>
      </div>

      {/* BLOCOS FUTUROS OPCIONAIS */}
      <div className="w-full max-w-4xl mx-auto mt-10 space-y-4">
        {etapas.includes('visa') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="bg-white shadow rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">Análise VISA</h2>
              <p className="text-sm text-gray-600">Campos futuros para dados sanitários.</p>
            </div>
          </motion.div>
        )}

        {etapas.includes('cbmmg') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="bg-white shadow rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">Análise Corpo de Bombeiros</h2>
              <p className="text-sm text-gray-600">Plano de prevenção e combate a incêndios.</p>
            </div>
          </motion.div>
        )}

        {etapas.includes('nbr9050') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="bg-white shadow rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">Acessibilidade - NBR 9050</h2>
              <p className="text-sm text-gray-600">Campos futuros para verificação de rampas, acessos e PCD.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
