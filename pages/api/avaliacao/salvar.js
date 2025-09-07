import runMiddleware from '../../../middleware/cors.js';
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  // Habilita o CORS para permitir requisições do seu front-end
  await runMiddleware(req, res);

  // Garante que a rota só responda a requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Extrai o array de avaliações do corpo da requisição
  const { avaliacoes } = req.body;

  // Validação básica para garantir que os dados de avaliação existem e são válidos
  if (!avaliacoes || !Array.isArray(avaliacoes) || avaliacoes.length === 0) {
    return res.status(400).json({ error: 'Dados de avaliação ausentes ou inválidos.' });
  }

  try {
    // Query para inserir múltiplas linhas de uma vez
    const query = `
      INSERT INTO avaliacao (id_aluno_fk, id_turma_fk, id_at_avaliativa_fk, id_indicador_fk, mencao, data_avaliacao) 
      VALUES ?
    `;

    // Mapeia o array de objetos para um array de arrays, no formato que a query SQL espera
    const valores = avaliacoes.map(av => [
      av.id_aluno_fk,
      av.id_turma_fk,
      av.id_at_avaliativa_fk,
      av.id_indicador_fk,
      av.mencao,
      new Date().toISOString().slice(0, 10), // Garante o formato 'YYYY-MM-DD'
    ]);

    // Executa a query no banco de dados
    await db.execute(query, [valores]);

    // Retorna uma resposta de sucesso
    res.status(201).json({ message: 'Avaliações salvas com sucesso!' });

  } catch (error) {
    console.error('Erro ao salvar avaliações:', error);
    res.status(500).json({
      error: 'Erro ao salvar avaliações.',
      details: error.message,
    });
  }
}
