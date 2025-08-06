import runMiddleware from '../../../middleware/cors';
import db from '../../db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  const { id } = req.query;

  if (req.method === 'GET') {
    if (!id) {
      return res.status(400).json({ erro: 'ID da turma não fornecido' });
    }

    try {
      const [rows] = await db.execute(
        `SELECT a.id_aluno, a.nome_aluno
         FROM aluno a
         INNER JOIN matricula m ON a.id_aluno = m.id_aluno_fk
         WHERE m.id_turma_fk = ?`,
        [id]
      );

      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      res.status(500).json({
        erro: 'Erro ao buscar alunos matriculados',
        detalhes: error.message
      });
    }
  } else {
    res.status(405).json({ erro: 'Método não permitido' });
  }
}
