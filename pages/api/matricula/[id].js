import db from '../../../lib/db.js';
import runMiddleware from '../../../middleware/cors';

export default async function handler(req, res) {
  // Executa o middleware CORS
  await runMiddleware(req, res);

  const { id } = req.query; // id da turma

  if (req.method === 'GET') {
    try {
      const rows = await db.execute(
        `SELECT m.id_matricula, a.id_aluno, a.nome_aluno, a.email_aluno
          FROM matricula m
          JOIN aluno a ON m.id_aluno_fk = a.id_aluno
          WHERE m.id_turma_fk = ?`,
        [id]
      );


      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar alunos matriculadosAQUI:', error.message);
      res.status(500).json({
        error: 'Erro ao listar alunos matriculados',
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido :-(' });
  }
}
