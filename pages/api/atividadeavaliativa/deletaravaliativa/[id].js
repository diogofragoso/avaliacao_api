import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../db.js'; // Ajuste conforme sua estrutura

export default async function handler(req, res) {
  await runMiddleware(req, res);  // Executa o CORS

  if (req.method === 'DELETE') {
    const { id } = req.query; // ID da atividade avaliativa

    if (!id) {
      return res.status(400).json({ error: 'ID da atividade não fornecido' });
    }

    try {
      const idNumber = Number(id);
      console.log('ID recebido para deleção da atividade:', idNumber);

      // Executa a exclusão no banco de dados
      const result = await db.execute('DELETE FROM atividade_avaliativa WHERE id_avaliativa = ?', [idNumber]);

      console.log('Resultado da deleção:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Atividade não encontrada' });
      }

      return res.status(200).json({ message: 'Atividade deletada com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      return res.status(500).json({ error: 'Erro ao deletar atividade', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
