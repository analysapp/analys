// pages/api/analisar.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { createWorker } from 'tesseract.js'
import { analisarProjeto } from '../../src/services/analisarProjeto'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Função auxiliar para converter PDF em imagem JPEG
async function convertPdfToImage(pdfPath: string): Promise<string> {
  const outputPath = pdfPath.replace(/\.pdf$/, '')

  // Garante que o diretório exista antes de tentar converter
  const outputDir = path.dirname(outputPath)
  fs.mkdirSync(outputDir, { recursive: true })

  const command = `"C:/poppler/bin/pdftoppm.exe" -jpeg "${pdfPath}" "${outputPath}"`


  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        console.error('Erro na conversão do PDF:', error)
        return reject(error)
      }
      resolve(`${outputPath}-1.jpg`)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  const form = formidable({
    multiples: false,
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro no upload:', err)
      return res.status(500).json({ message: 'Erro no upload' })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'Arquivo inválido' })
    }

    try {
      let imagePath = file.filepath

      if (file.mimetype === 'application/pdf') {
        imagePath = await convertPdfToImage(file.filepath)
      }

      const worker = await createWorker('por')
      const { data } = await worker.recognize(imagePath)
      await worker.terminate()

      console.log('Texto extraído pelo OCR:')
console.log(data.text)

      const resultado = await analisarProjeto(data.text)
      return res.status(200).json({ resultado })
    } catch (error) {
      console.error('Erro na análise:', error)
      return res.status(500).json({ message: 'Erro durante análise do projeto' })
    }
  })
}
