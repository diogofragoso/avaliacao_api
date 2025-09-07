import runMiddleware from '../../../middleware/cors';
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'GET') {
    try {
      const rows = await db.execute('SELECT id_uc, nome_uc, numero_uc, id_curso_fk FROM uc');
      res.status(200).json(rows); // <- agora sim, só os dados
    } catch (error) {
      console.error('Erro ao listar cursos:', error);
      res.status(500).json({ error: 'Erro ao listar cursos', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
