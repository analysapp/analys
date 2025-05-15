import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { auth } from '../lib/firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'


export default function Registro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })

  const [mensagem, setMensagem] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.senha !== formData.confirmarSenha) {
      setMensagem('As senhas não coincidem.')
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.senha)
      setMensagem('Conta criada com sucesso!')
    } catch (err: any) {
      setMensagem(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm">
      <Head>
        <title>Registro - Analys</title>
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
      </nav>

      {/* Formulário de Registro */}
      <div className="flex flex-col items-center justify-center flex-grow px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Criar Conta</h2>
          {mensagem && <p className="text-sm text-center text-red-500 mb-4">{mensagem}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={formData.senha}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmarSenha"
              placeholder="Confirmar senha"
              className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />
            <button type="submit" className="w-full px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
              Criar Conta
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
