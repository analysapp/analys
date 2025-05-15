// pages/recuperar-senha.tsx

import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebaseConfig'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState<string | null>(null)

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(auth, email)
      setMensagem('Um e-mail de recuperação foi enviado com sucesso.')
    } catch (error: any) {
      console.error('Erro ao recuperar senha:', error)
      setMensagem('Erro ao enviar e-mail. Verifique o endereço e tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col items-center justify-center font-dm px-4">
      <Head>
        <title>Recuperar Senha | Analys</title>
      </Head>

      {/* Menu Superior */}
      <nav className="flex justify-end w-full p-6 gap-10 text-black text-sm font-light">
        <Link href="/">home</Link>
        <Link href="/sobre">sobre</Link>
        <Link href="/servicos">serviços</Link>
        <Link href="/contato">contato</Link>
      </nav>

      {/* Formulário */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-2xl font-semibold mb-6">Recuperar Senha</h1>
        
        {mensagem && (
          <p className="text-sm text-green-600 mb-4 text-center max-w-xs">{mensagem}</p>
        )}

        <form onSubmit={handleRecuperar} className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            required
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
            Enviar link de recuperação
          </button>
        </form>

        <Link href="/login" className="mt-6 text-sm text-gray-600 hover:underline">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
