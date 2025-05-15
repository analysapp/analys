// pages/guianormativo.tsx – Com subcategoria e checklist adaptativo por tipo

import { useState } from 'react';
import Head from 'next/head';

const tiposProjeto = [
  'Residencial Unifamiliar',
  'Residencial Multifamiliar',
  'Comercial / Serviços',
  'Estabelecimento de Saúde',
  'Educacional',
  'Industrial',
  'Misto / Uso Combinado',
  'Equipamento Público',
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
    { nome: 'Sanitário PCD (público ou funcionários)' },
    { nome: 'Sala de espera' },
    { nome: 'Depósito de material de limpeza (DML)' },
    { nome: 'Sala de expurgo' },
    { nome: 'Central de Material Esterilizado (CME)' },
    { nome: 'Vestiário para funcionários' },
    { nome: 'Sala de Raio-X' },
    { nome: 'Sala de Revelação / Estação digital' },
    { nome: 'Depósito de materiais e instrumental' },
    { nome: 'Laboratório de prótese / Sala de moldagem' }
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
    console.log("🔍 Disparando geração de relatório...");

    if (!tipoProjeto || !subtipo || ambientesSelecionados.length === 0) {
      console.log("⚠️ Dados incompletos:", { tipoProjeto, subtipo, ambientesSelecionados });
      setResultado("⚠️ Preencha todos os campos e selecione ao menos um ambiente.");
      return;
    }

    try {
      console.log("📤 Enviando para API:", {
        tipo_projeto: tipoProjeto,
        subtipo,
        ambientes: ambientesSelecionados
      });

      const response = await fetch("http://localhost:8000/api/guianormativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_projeto: tipoProjeto,
          subtipo,
          ambientes: ambientesSelecionados
        })
      });

      const data = await response.json();
      console.log("✅ Resposta da API:", data);

      setResultado(data.relatorio || JSON.stringify(data, null, 2));

    } catch (error) {
      console.error("❌ Erro ao gerar relatório:", error);
      setResultado("❌ Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <Head><title>Guia Normativo</title></Head>

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
        <div className="mt-8 border rounded p-4 bg-gray-50 text-left">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{resultado}</pre>
        </div>
      )}
    </div>
  );
}
