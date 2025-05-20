import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../db.js'; // Certifique-se de que o caminho está correto

export default async function handler(req, res) {
  await runMiddleware(req, res); // Executa o CORS

  if (req.method === 'PUT') {
    const { id_avaliativa, descricao, id_indicador_fk } = req.body;

    // Validação dos campos
    if (!id_avaliativa || !descricao || !id_indicador_fk) {
      return res.status(400).json({ error: 'ID da atividade, descrição e ID do indicador são obrigatórios.' });
    }

    try {
      // Atualizando a atividade avaliativa no banco de dados
      const result = await db.execute(
        'UPDATE atividade_avaliativa SET descricao_avaliativa = ?, id_indicador_fk = ? WHERE id_avaliativa = ?',
        [descricao, id_indicador_fk, id_avaliativa]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Atividade não encontrada.' });
      }

      return res.status(200).json({ message: 'Atividade atualizada com sucesso!' });
    } catch (error) {
      console.error('Erro ao editar atividade:', error);
      return res.status(500).json({ error: 'Erro ao editar atividade.', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
