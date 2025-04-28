// pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro ao fazer upload:', err);
      return res.status(500).json({ message: 'Erro ao fazer upload' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'Arquivo inválido' });
    }

    const pdfUrl = `/uploads/${path.basename(file.filepath)}`;

    try {
      const projeto = await prisma.project.create({
        data: {
          title: (Array.isArray(fields.title) ? fields.title[0] : fields.title) || 'Sem título',
          description: (Array.isArray(fields.description) ? fields.description[0] : fields.description) || 'Sem descrição',
          pdfUrl: pdfUrl,
          cidade: (Array.isArray(fields.cidade) ? fields.cidade[0] : fields.cidade) || 'não informado',
          tipoProjeto: (Array.isArray(fields.tipoProjeto) ? fields.tipoProjeto[0] : fields.tipoProjeto) || 'não informado',
          userId: parseInt(session.user.id),
        },
      });

      return res.status(200).json({ projeto });
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      return res.status(500).json({ message: 'Erro ao salvar no banco' });
    }
  });
}
