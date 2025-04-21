// pages/api/ucs/editar/[id].js

import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../db.js'; // Correção do caminho para o arquivo de conexão com o banco de dados

export default async function handler(req, res) {
  await runMiddleware(req, res); // Garante que o CORS será executado antes

  if (req.method === 'PUT') {
    const { id } = req.query; // ID da UC a ser editada
    const { nome_uc, numero_uc } = req.body; // Os dados da UC a serem atualizados

    if (!id || !nome_uc || !numero_uc) {
      return res.status(400).json({ error: 'Dados incompletos para edição' });
    }

    try {
      // A consulta SQL para atualizar a UC com o ID informado
      const result = await db.execute(
        'UPDATE uc SET nome_uc = ?, numero_uc = ? WHERE id_uc = ?',
        [nome_uc, numero_uc, Number(id)]
      );

      console.log('ID recebido para edição:', id);
      console.log('Resultado da edição:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'UC não encontrada' });
      }

      return res.status(200).json({ message: 'UC editada com sucesso!' });
    } catch (error) {
      console.error('Erro ao editar UC:', error);
      return res.status(500).json({ error: 'Erro ao editar UC', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' }); // Para métodos diferentes de PUT
  }
}
