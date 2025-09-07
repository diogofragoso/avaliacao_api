import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js'; // Corrige o caminho para o arquivo de conexão com o banco de dados

export default async function handler(req, res) {
  await runMiddleware(req, res);  // Garante que o CORS será executado antes

  if (req.method === 'DELETE') {
    const { id } = req.query; // ID do indicador a ser deletado

    if (!id) {
      return res.status(400).json({ error: 'ID não fornecido' });
    }

    try {
      // Convertendo o id para número
      const idNumber = Number(id);
      console.log('ID recebido para deleção:', idNumber);

      // A consulta SQL para deletar o indicador com o ID informado
      const result = await db.execute('DELETE FROM indicador WHERE id_indicador = ?', [Number(id)]);

      console.log('Resultado da deleção:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Indicador não encontrado' });
      }

      return res.status(200).json({ message: 'Indicador deletado com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar indicador:', error);
      return res.status(500).json({ error: 'Erro ao deletar indicador', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
