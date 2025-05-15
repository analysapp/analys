// pages/api/guianormativo.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Simulação de banco de dados de normas
const normas = [
  {
    keywords: ['consultório', 'odontológico'],
    norma: 'RDC 50/ANVISA',
    exigencia: 'Lavabo na entrada da sala de atendimento',
    aplicacao: 'Cada sala de atendimento deve possuir um lavatório com acionamento não manual.'
  },
  {
    keywords: ['sala', 'atendimento', 'acessível'],
    norma: 'NBR 9050:2020',
    exigencia: 'Acessibilidade nas áreas comuns',
    aplicacao: 'É obrigatória a existência de rota acessível até os consultórios e banheiros.'
  },
  {
    keywords: ['banheiro', 'pacientes'],
    norma: 'NBR 9050:2020',
    exigencia: 'Sanitário acessível para pacientes',
    aplicacao: 'É obrigatória a existência de pelo menos um sanitário PCD próximo à recepção.'
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { descricao } = req.body;

  if (!descricao || typeof descricao !== 'string') {
    return res.status(400).json({ error: 'Descrição inválida' });
  }

  const descLower = descricao.toLowerCase();

  // Busca por normas que tenham pelo menos uma keyword presente
  const resultado = normas.filter((item) =>
    item.keywords.some((kw) => descLower.includes(kw))
  );

  res.status(200).json({ resultado });
}
