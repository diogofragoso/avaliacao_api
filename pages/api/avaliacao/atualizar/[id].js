import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { id } = req.query;
    // ALTERAÇÃO 1: Adicionado `acao_recuperacao` para ser lido do corpo da requisição
    const { mencao, data_avaliacao, observacao_avaliacao, acao_recuperacao } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id_avaliacao é obrigatório.' });
    }

    const updates = [];
    const values = [];

    // Lógica para os campos existentes (sem alteração)
    if (mencao !== undefined) {
      updates.push('mencao = ?');
      values.push(mencao);
    }
    if (data_avaliacao !== undefined) {
      updates.push('data_avaliacao = ?');
      values.push(data_avaliacao);
    }
    if (observacao_avaliacao !== undefined) {
      updates.push('observacao_avaliacao = ?');
      values.push(observacao_avaliacao);
    }

    // ALTERAÇÃO 2: Adicionada a lógica para o novo campo
    if (acao_recuperacao !== undefined) {
      updates.push('acao_recuperacao = ?');
      values.push(acao_recuperacao);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    values.push(id);

    const query = `
      UPDATE avaliacao
      SET ${updates.join(', ')}
      WHERE id_avaliacao = ?
    `;
    
    // O `db.execute` já está correto
    const result = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    return res.status(200).json({ message: 'Avaliação atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro em /avaliacao/atualizar:', error);
    res.status(500).json({ error: 'Erro no servidor.', details: error.message });
  }
}