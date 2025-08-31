import runMiddleware from '../../../middleware/cors.js';
import db from '../../db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'GET') {
    try {
      // Consulta que retorna curso, quantidade de UCs e quantidade de indicadores
      const query = `
        SELECT 
          c.id_curso,
          c.nome_curso,
          COUNT(DISTINCT uc.id_uc) AS total_ucs,
          COUNT(DISTINCT i.id_indicador) AS total_indicadores
        FROM curso c
        LEFT JOIN uc ON uc.id_curso_fk = c.id_curso
        LEFT JOIN indicador i ON i.id_uc_fk = uc.id_uc
        GROUP BY c.id_curso, c.nome_curso
      `;

      const [rows] = await db.execute(query);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar cursos com UCs e indicadores:', error);
      res.status(500).json({ error: 'Erro ao listar cursos com UCs e indicadores', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
