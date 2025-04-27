import Head from 'next/head'
import Image from 'next/image'

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
        <a href="#">home</a>
        <a href="#">sobre</a>
        <a href="#">serviços</a>
        <a href="#">contato</a>
        <a href="#">login</a>
      </nav>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center justify-center flex-grow">

        {/* Logo + Nome */}
        <div className="flex items-center gap-4 mb-10">
          {/* Ícone */}
          <Image
            src="/icone.png"  // nome do seu arquivo na pasta public
            alt="Logo Analys"
            width={96}         // ⬅️ Agora com 96px (+20% em relação ao anterior)
            height={96}        // ⬅️ Agora com 96px (+20%)
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
