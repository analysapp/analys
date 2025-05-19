import { useState, useRef } from 'react';
import Head from 'next/head';
import Topo from '@/components/Topo';

const tiposProjeto = [
  'Residencial Unifamiliar',
  'Residencial Multifamiliar',
  'Comercial / Serviços',
  'Estabelecimento de Saúde',
  'Educacional',
  'Industrial',
  'Misto / Uso Combinado',
  'Equipamento Público'
];

const subcategorias: Record<string, string[]> = {
  'Estabelecimento de Saúde': [
    'Consultório Odontológico',
    'Consultório Médico',
    'Fisioterapia',
    'Clínica Geral',
    'Laboratório',
    'Unidade de Pronto Atendimento'
  ]
};

const ambientesPorSubtipo: Record<string, { nome: string; possuiQuantidade?: boolean }[]> = {
  'Consultório Odontológico': [
    { nome: 'Consultório odontológico', possuiQuantidade: true },
    { nome: 'Sala de Raio-X' }
  ]
};

interface AmbienteSelecionado {
  nome: string;
  quantidade?: number;
}

export default function GuiaNormativo() {
  const [tipoProjeto, setTipoProjeto] = useState('');
  const [subtipo, setSubtipo] = useState('');
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<AmbienteSelecionado[]>([]);
  const [resultado, setResultado] = useState('');
  const relatorioRef = useRef<HTMLDivElement>(null);

  const ambientesDisponiveis = ambientesPorSubtipo[subtipo] || [];

  const toggleAmbiente = (nome: string) => {
    const jaExiste = ambientesSelecionados.find(a => a.nome === nome);
    if (jaExiste) {
      setAmbientesSelecionados(ambientesSelecionados.filter(a => a.nome !== nome));
    } else {
      setAmbientesSelecionados([...ambientesSelecionados, { nome, quantidade: 1 }]);
    }
  };

  const alterarQuantidade = (nome: string, qtd: number) => {
    setAmbientesSelecionados(
      ambientesSelecionados.map(a =>
        a.nome === nome ? { ...a, quantidade: qtd } : a
      )
    );
  };

  const gerarRelatorio = async () => {
    if (!tipoProjeto || !subtipo || ambientesSelecionados.length === 0) {
      setResultado("⚠️ Preencha todos os campos e selecione ao menos um ambiente.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/guianormativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo_projeto: tipoProjeto, subtipo, ambientes: ambientesSelecionados })
      });
      const data = await response.text();
      setResultado(data);
    } catch (error) {
      setResultado("❌ Erro ao conectar com o servidor.");
    }
  };

  const imprimirRelatorio = () => {
    if (!relatorioRef.current) return;
    const conteudo = relatorioRef.current.innerHTML;
    const janela = window.open('', '', 'width=800,height=1000');
    if (janela) {
      janela.document.write(`
        <html>
        <head>
          <title>Relatório normativo - ${tipoProjeto} - ${subtipo}</title>
          <style>
            body {
              font-family: 'DM Sans', sans-serif;
              padding: 2rem;
              background: white;
              line-height: 1.6;
              font-size: 15px;
            }
            h2 {
              font-size: 18px;
              margin-top: 2rem;
              font-weight: bold;
              border-bottom: 1px solid #ccc;
              padding-bottom: 0.3rem;
            }
            li {
              margin-bottom: 10px;
            }
            .marca {
              position: fixed;
              top: 35%;
              left: 20%;
              opacity: 0.05;
              z-index: 0;
              width: 60%;
            }
          </style>
        </head>
        <body>
          <img class="marca" src="/teste logo.png" alt="logo" />
          <h1>Relatório normativo - ${tipoProjeto} - ${subtipo}</h1>
          ${conteudo}
        </body>
        </html>
      `);
      janela.document.close();
      janela.print();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <Head>
        <title>Guia Normativo</title>
      </Head>
      <Topo />

      <h1 className="text-3xl font-semibold mb-6">Guia Normativo</h1>

      <div className="mb-4 text-left">
        <label className="block mb-2 font-medium">Tipo de projeto:</label>
        <select
          value={tipoProjeto}
          onChange={(e) => {
            setTipoProjeto(e.target.value);
            setSubtipo('');
            setAmbientesSelecionados([]);
          }}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Selecione...</option>
          {tiposProjeto.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>

      {tipoProjeto && subcategorias[tipoProjeto] && (
        <div className="mb-6 text-left">
          <label className="block mb-2 font-medium">Subcategoria:</label>
          <select
            value={subtipo}
            onChange={(e) => {
              setSubtipo(e.target.value);
              setAmbientesSelecionados([]);
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecione...</option>
            {subcategorias[tipoProjeto].map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      {subtipo && ambientesDisponiveis.length > 0 && (
        <div className="mb-6 text-left">
          <label className="block mb-2 font-medium">Ambientes previstos:</label>
          <div className="flex flex-col gap-3">
            {ambientesDisponiveis.map((ambiente) => {
              const selecionado = ambientesSelecionados.find(a => a.nome === ambiente.nome);
              return (
                <div key={ambiente.nome} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!selecionado}
                    onChange={() => toggleAmbiente(ambiente.nome)}
                  />
                  <label className="flex-1">{ambiente.nome}</label>
                  {ambiente.possuiQuantidade && selecionado && (
                    <input
                      type="number"
                      min={1}
                      value={selecionado.quantidade}
                      onChange={(e) => alterarQuantidade(ambiente.nome, parseInt(e.target.value) || 1)}
                      className="w-20 border px-2 py-1 rounded"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        className="bg-black text-white px-6 py-2 rounded-full font-medium disabled:opacity-50"
        onClick={gerarRelatorio}
        disabled={!tipoProjeto || !subtipo || ambientesSelecionados.length === 0}
      >
        Gerar Relatório Normativo
      </button>

      {resultado && (
        <div className="mt-10 relative bg-white p-8 rounded-xl shadow-xl text-left font-dm text-[15px] leading-relaxed overflow-hidden print:bg-white">
          {/* ✅ Marca d’água */}
          <div
            className="absolute inset-0 z-0 opacity-5 bg-center bg-no-repeat bg-contain pointer-events-none"
            style={{ backgroundImage: "url('/teste logo.png')" }}
          />
          {/* ✅ Conteúdo */}
          <div ref={relatorioRef} className="relative z-10 prose max-w-none space-y-4" dangerouslySetInnerHTML={{ __html: resultado }} />

          {/* ✅ Botão PDF ao final */}
          <div className="mt-8 print:hidden text-right">
            <button
              onClick={imprimirRelatorio}
              className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800"
            >
              Salvar como PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
