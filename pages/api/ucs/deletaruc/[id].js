// pages/api/ucs/deletar/[id].js

import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../db.js'; // Corrige o caminho para o arquivo de conexão com o banco de dados

export default async function handler(req, res) {
  await runMiddleware(req, res);  // Garante que o CORS será executado antes

  if (req.method === 'DELETE') {
    const { id } = req.query; // ID da UC a ser deletada

    if (!id) {
      return res.status(400).json({ error: 'ID da UC não fornecido' });
    }

    try {
      // A consulta SQL para deletar a UC com o ID informado
      const result = await db.execute('DELETE FROM uc WHERE id_uc = ?',[Number(id)]); 
      console.log('ID recebido para deleção:', id);
        console.log('Resultado da deleção:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'UC não encontrada' });
      }

      return res.status(200).json({ message: 'UC deletada com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar UC:', error);
      console.error('Erro ao excluir a UC:', error.message);

      return res.status(500).json({ error: 'Erro ao deletar UC', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' }); // Para métodos diferentes de DELETE
  }
}
