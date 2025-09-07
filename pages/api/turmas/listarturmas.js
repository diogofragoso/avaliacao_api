import runMiddleware from '../../../middleware/cors.js'; // ajuste conforme sua estrutura
import db from '../../../lib/db.js'; // ajuste conforme sua estrutura

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'GET') {
    try {
      const rows = await db.execute(
        `SELECT 
           id_turma, 
           nome_turma, 
           periodo_turma, 
           max_aluno_turma, 
           data_inicio_turma, 
           id_curso_fk 
         FROM turma`
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Nenhuma turma encontrada.' });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar turmas:', error);
      res.status(500).json({ error: 'Erro ao listar turmas', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
