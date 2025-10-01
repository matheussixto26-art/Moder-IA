// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a chave da API das variáveis de ambiente (o jeito seguro!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Função principal que a Vercel vai executar
export default async function handler(req, res) {
  // Garante que só aceitamos requisições do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Nenhuma descrição (prompt) foi fornecida.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Este é o "prompt" que damos para a IA. É importante ser específico!
    const aiPrompt = `
      Você é um assistente de modelagem 3D.
      Sua tarefa é gerar o conteúdo de um arquivo no formato Wavefront .obj para um(a) "${prompt}".
      O resultado deve ser APENAS o texto puro do conteúdo do arquivo .obj.
      Não inclua explicações, comentários, ou a formatação de código (como \`\`\`obj).
      Comece diretamente com "v" (vértices), "vt" (coordenadas de textura), "vn" (normais de vértice) ou "f" (faces).
    `;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const modelData = response.text();

    // Envia o código .obj de volta para o frontend
    res.status(200).send(modelData);

  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    res.status(500).json({ error: 'Falha ao gerar o modelo 3D.' });
  }
}
