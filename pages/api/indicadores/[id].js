// Arquivo: api/indicadores/[id].js
import runMiddleware from '../../../middleware/cors.js'; // Ajuste o caminho conforme necessário
import db from '../../db.js'; // Ajuste o caminho conforme necessário

export default async function handler(req, res) {
  await runMiddleware(req, res);

  const { id } = req.query; // id será o parâmetro dinâmico na URL (ex: /api/indicadores/1)

  if (req.method === 'GET') {
    try {
      const rows = await db.execute(
        'SELECT id_indicador, numero_indicador, descricao_indicador FROM indicador WHERE id_uc_fk = ?',
        [id] // id será o id_uc vindo da URL
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Nenhum indicador encontrado para esta UC.' });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar indicadores:', error);
      res.status(500).json({ error: 'Erro ao listar indicadores', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
