import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-dm transition-colors duration-300">
      <Head>
        <title>Analys</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Menu Superior */}
      <nav className="flex justify-end p-6 gap-10 text-[var(--foreground)] text-sm font-light items-center">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
        <Link href="/login">
          <span className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-full hover:opacity-80 transition">
            login
          </span>
        </Link>
      </nav>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/icone.png"
            alt="Logo Analys"
            width={192}
            height={192}
          />
          <h1 className="text-8xl font-semibold flex items-baseline gap-2">
            analys
            <span className="w-3 h-3 rounded-full bg-[var(--foreground)] animate-pulse mb-1"></span>
          </h1>
        </div>
        <p className="text-lg font-medium mt-0">
          pré-análise inteligente de projetos | guia normativo | cruzamento de dados
        </p>
      </div>

      {/* Rodapé */}
      <footer className="text-center text-xs text-[var(--foreground)]/70 py-4">
        © {new Date().getFullYear()} Analys. Todos os direitos reservados.
      </footer>
    </div>
  );
}
