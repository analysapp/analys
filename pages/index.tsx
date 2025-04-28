import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link' // ✅ Importa o Link do Next.js

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm">
      <Head>
        <title>Analys</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Menu Superior */}
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
        <Link href="/login">login</Link>
      </nav>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center justify-center flex-grow">

        {/* Logo + Nome */}
        <div className="flex items-center gap-4 mb-10">
          {/* Ícone */}
          <Image
            src="/icone.png"  
            alt="Logo Analys"
            width={96}        
            height={96}        
            className="translate-y-1"
          />

          {/* Nome Analys */}
          <h1 className="text-8xl font-semibold text-black">
            analys
          </h1>
        </div>

        {/* Botão Nova Análise */}
        <button className="px-6 py-2 bg-black text-white text-base rounded-full hover:bg-gray-800 transition">
          nova análise
        </button>

      </div>
    </div>
  );
}
