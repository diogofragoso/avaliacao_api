import runMiddleware from '../../middleware/cors.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const answer = data.choices[0].message.content;
      return res.status(200).json({ answer });
    } else {
      // Tratamento especial para erro de cota excedida
      if (data.error && data.error.message && data.error.message.toLowerCase().includes('quota')) {
        return res.status(429).json({
          error: 'Limite de uso da API OpenAI atingido. Por favor, verifique seu plano e créditos.',
        });
      }
      return res.status(response.status).json({ error: data.error.message || 'Erro na API OpenAI' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
}
