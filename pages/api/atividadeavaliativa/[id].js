import runMiddleware from '../../../middleware/cors.js'; // Ajuste o caminho conforme necessário
import db from '../../../lib/db.js'; // Ajuste o caminho conforme necessário

export default async function handler(req, res) {
  await runMiddleware(req, res);

  const { id } = req.query; // id será o parâmetro dinâmico na URL (ex: /api/stividadesavaliativas/1)

  if (req.method === 'GET') {
    try {
      const rows = await db.execute(
        'SELECT * FROM atividade_avaliativa WHERE id_indicador_fk = ?',
        [id] // id será o id do indicador que você está buscando
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Nenhuma atividade avaliativa encontrada para esta UC.' });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar atividades avaliativas:', error);
      res.status(500).json({ error: 'Erro ao listar atividades avaliativas', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
