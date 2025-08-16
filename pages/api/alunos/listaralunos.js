import db from '../../db.js';
import runMiddleware from '../../../middleware/cors';

export default async function handler(req, res) {
  // Executa o middleware CORS
  await runMiddleware(req, res);

  if (req.method === 'GET') {
    try {
      const rows = await db.execute(
        'SELECT id_aluno, nome_aluno, email_aluno FROM aluno'
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar os alunos:', error.message);
      res.status(500).json({
        error: 'Erro ao listar os alunos',
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido :-(' });
  }
}
