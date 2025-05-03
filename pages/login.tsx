import Head from 'next/head'
import Link from 'next/link'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../lib/firebaseConfig'

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      console.log("Usuário logado:", result.user)
      alert(`Bem-vindo, ${result.user.displayName}`)
    } catch (error) {
      console.error("Erro ao logar com o Google:", error)
      alert("Erro ao logar com o Google")
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm">
      <Head>
        <title>Login - Analys</title>
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
      </nav>

      {/* Conteúdo Central */}
      <div className="flex flex-col items-center justify-center flex-grow px-4">

        {/* Botão de login com Google */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center gap-4 px-6 py-3 bg-white border border-gray-300 rounded-full shadow hover:shadow-md transition mb-6"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          <span className="text-sm text-gray-700 font-medium">Entrar com o Google</span>
        </button>

        {/* Separador */}
        <div className="flex items-center w-full max-w-xs mb-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Formulário de login */}
        <form className="flex flex-col w-full max-w-xs gap-4">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <input
            type="password"
            placeholder="Senha"
            className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button type="submit" className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
            Entrar
          </button>
        </form>

        {/* Links adicionais */}
        <div className="flex flex-col items-center gap-2 mt-6 text-sm text-gray-600">
          <Link href="/recuperar-senha" className="hover:underline">Recuperar senha</Link>
          <span>ou</span>
          <Link href="/registro">
            <span className="text-black font-medium hover:underline">Criar conta</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
