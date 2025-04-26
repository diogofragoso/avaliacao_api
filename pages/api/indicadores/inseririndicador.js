import db from '../../db.js'; // Ajuste o caminho conforme necessário
import runMiddleware from '1../../../../middleware/cors.js'; // Ajuste o caminho conforme necessário'

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'POST') {
    const { numero_indicador, descricao_indicador, id_uc_fk } = req.body;

    try {
      const query = 'INSERT INTO indicador (numero_indicador, descricao_indicador, id_uc_fk) VALUES (?, ?, ?)';
      await db.execute(query, [numero_indicador, descricao_indicador, id_uc_fk]);

      res.status(200).json({ message: 'Dados inseridos com sucesso!' });
    } catch (error) {
      console.error('Erro ao inserir dados:', error);
      res.status(500).json({ error: 'Erro ao inserir dados', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
