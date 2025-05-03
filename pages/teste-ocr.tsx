import { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function TesteOCR() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textResult, setTextResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await processImage(file);  // já inicia o processamento depois de escolher
    }
  };

  const processImage = async (file: File) => {
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) return;

        const blob = new Blob([arrayBuffer]);
        const url = URL.createObjectURL(blob);

        const { data } = await Tesseract.recognize(url, 'por', {
          logger: (m) => console.log(m), // loga progresso
        });

        setTextResult(data.text);
        setIsLoading(false);
        URL.revokeObjectURL(url); // limpa a memória
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao processar:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f7f7f5] font-dm">
      <h1 className="text-3xl font-bold mb-6">Teste de OCR</h1>

      <label className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 cursor-pointer mb-6">
        {isLoading ? 'Processando...' : 'Selecionar Imagem ou PDF'}
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <div className="w-full max-w-3xl bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Resultado OCR:</h2>
        <pre className="whitespace-pre-wrap">{textResult}</pre>
      </div>
    </div>
  );
}
