import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { nome, email, senha, confirmarSenha } = req.body

    // Exemplo de verificação (pode expandir depois)
    if (!nome || !email || senha !== confirmarSenha) {
      return res.status(400).json({ message: 'Verifique os campos do formulário.' })
    }

    // Aqui você pode salvar os dados em um banco real
    return res.status(200).json({ message: 'Usuário registrado com sucesso!' })
  }

  return res.status(405).json({ message: 'Método não permitido' })
}
