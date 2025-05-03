import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

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
      <nav className="flex justify-end p-6 gap-10 text-black text-sm font-light items-center">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
        <Link href="/login">
          <span className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
            login
          </span>
        </Link>
      </nav>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center justify-center flex-grow">

        {/* Logo + Nome */}
        <div className="flex items-center gap-4 mb-6">
          {/* Ícone */}
          <Image
            src="/icone.png"
            alt="Logo Analys"
            width={96}
            height={96}
          />

          {/* Nome + Ponto Piscante */}
          <h1 className="text-8xl font-semibold text-black flex items-end gap-2">
            analys
            <span className="w-3 h-3 rounded-full bg-black animate-pulse translate-y-1.5"></span>
          </h1>
        </div>

        {/* Frase abaixo */}
        <p className="text-lg text-gray-700 font-medium mt-4">
          pré-análise inteligente de projetos
        </p>

      </div>
    </div>
  );
}
