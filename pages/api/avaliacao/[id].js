import runMiddleware from '../../../middleware/cors.js';
import db from '../../db.js';

export default async function handler(req, res) {
  // Habilita CORS
  await runMiddleware(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id } = req.query; // pega o id do curso da URL
  if (!id) return res.status(400).json({ error: 'ID do curso é obrigatório' });

  try {
    // Consulta para retornar curso específico, quantidade de UCs e indicadores
    const query = `
      SELECT 
        c.id_curso,
        c.nome_curso,
        COUNT(DISTINCT uc.id_uc) AS total_ucs,
        COUNT(DISTINCT i.id_indicador) AS total_indicadores
      FROM curso c
      LEFT JOIN uc ON uc.id_curso_fk = c.id_curso
      LEFT JOIN indicador i ON i.id_uc_fk = uc.id_uc
      WHERE c.id_curso = ?
      GROUP BY c.id_curso, c.nome_curso
    `;

    const rows = await db.execute(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    // Retorna apenas o objeto do curso solicitado
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao listar curso com UCs e indicadores:', error);
    res.status(500).json({
      error: 'Erro ao listar curso com UCs e indicadores',
      details: error.message,
    });
  }
}
