import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: (router.query.callbackUrl as string) || '/conta', // 🔥 Aqui ajustamos para ir para /conta
    })

    if (result?.error) {
      setError('Email ou senha incorretos!')
    } else {
      window.location.href = result?.url || '/conta'
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm">
      <Head>
        <title>Login | Analys</title>
      </Head>

      {/* Cabeçalho */}
      <nav className="flex items-center justify-between p-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/icone.png"
            alt="Logo Analys"
            width={48}
            height={48}
            className="translate-y-1"
          />
          <span className="text-4xl font-semibold text-black translate-y-1">
            analys
          </span>
        </div>

        {/* Menu */}
        <div className="flex gap-10 text-black text-sm font-light">
          <Link href="/">home</Link>
          <Link href="/sobre">sobre</Link>
          <Link href="/servicos">serviços</Link>
          <Link href="/contato">contato</Link>
          <Link href="/login">login</Link>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="flex flex-col items-center justify-center flex-grow">

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-80">
          {/* Campo Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Campo Senha */}
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Botão Entrar */}
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white text-base rounded-full hover:bg-gray-800 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
