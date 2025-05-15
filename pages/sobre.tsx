import Head from 'next/head';
import Link from 'next/link';

export default function Sobre() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col font-dm">
      <Head>
        <title>Sobre | Analys</title>
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
      <div className="flex flex-col items-center justify-center flex-grow px-6">
        <div className="max-w-4xl text-black text-justify leading-relaxed text-base">
          <h1 className="text-3xl font-semibold text-center mb-8">sobre a analys</h1>

          <p className="mb-5 indent-5">
            <strong>analys</strong> é uma plataforma digital desenvolvida para <strong>otimizar a análise técnica de projetos arquitetônicos</strong>, com foco em conformidade normativa e agilidade nos processos de aprovação.
          </p>

          <p className="mb-5 indent-5">
            A ferramenta realiza <strong>verificações automáticas baseadas em legislações vigentes</strong>, interpreta normas específicas conforme o uso do projeto e gera relatórios objetivos com orientações técnicas claras. Seu uso contribui para a <strong>padronização de critérios, redução de retrabalho e melhoria na qualidade das submissões</strong> recebidas pelos órgãos públicos.
          </p>

          <p className="indent-5">
            Projetada por profissionais da área, a <strong>analys</strong> alia tecnologia e conhecimento técnico para <strong>apoiar arquitetos, engenheiros e instituições públicas</strong> no cumprimento das exigências legais, promovendo um processo mais seguro, transparente e eficiente.
          </p>
        </div>
      </div>
    </div>
  );
}
