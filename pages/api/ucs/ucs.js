import db from '../../../lib/db.js';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'POST') {
    const { nome_uc, numero_uc, id_curso_fk } = req.body;

    try {
      const query = 'INSERT INTO uc (nome_uc, numero_uc, id_curso_fk) VALUES (?, ?, ?)';
      await db.execute(query, [nome_uc, numero_uc, id_curso_fk]);

      res.status(200).json({ message: 'Dados inseridos com sucesso!' });
    } catch (error) {
      console.error('Erro ao inserir dados:', error);
      res.status(500).json({ error: 'Erro ao inserir dados', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
