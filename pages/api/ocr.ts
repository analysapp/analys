import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Desabilitar o parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função para converter PDF em imagem usando Poppler
async function convertPdfToImage(pdfPath: string): Promise<string> {
  const popplerPath = '"C:/Program Files/poppler-24.08.0/Library/bin/pdftoppm.exe"'; // <-- Caminho correto do seu sistema
  const outputPath = pdfPath.replace(/\.pdf$/, ''); // Remove .pdf do nome
  const command = `${popplerPath} -jpeg "${pdfPath}" "${outputPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        console.error('Erro na conversão do PDF:', error);
        return reject(error);
      }
      resolve(`${outputPath}-1.jpg`); // Poppler gera imagens com sufixo "-1.jpg"
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const form = formidable({
    multiples: false,
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro no upload:', err);
      return res.status(500).json({ message: 'Erro no upload' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'Arquivo inválido' });
    }

    let imagePath = file.filepath;

    if (file.mimetype === 'application/pdf') {
      try {
        imagePath = await convertPdfToImage(file.filepath);
      } catch (error) {
        console.error('Erro convertendo PDF:', error);
        return res.status(500).json({ message: 'Erro ao converter PDF' });
      }
    }

    const worker = await createWorker('por'); // Português

    try {
      const { data } = await worker.recognize(imagePath);
      await worker.terminate();
      return res.status(200).json({ text: data.text });
    } catch (error) {
      console.error('Erro no OCR:', error);
      return res.status(500).json({ message: 'Erro no OCR' });
    }
  });
}
