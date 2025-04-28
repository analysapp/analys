import Head from 'next/head'
import Link from 'next/link'

export default function Contato() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm">
      <Head>
        <title>Contato | Analys</title>
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
        <h1 className="text-3xl font-semibold text-black">
          Página Contato - Em construção...
        </h1>
      </div>
    </div>
  )
}
