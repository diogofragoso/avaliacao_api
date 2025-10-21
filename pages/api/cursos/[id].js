import db from '../../../lib/db.js';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  const { id } = req.query;

  // Verifica se o ID é válido
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID do curso inválido.' });
  }

  // ================================
  // PUT → Atualizar curso existente
  // ================================
  if (req.method === 'PUT') {
    try {
      const { nome_curso, descricao_curso } = req.body;

      if (!nome_curso || nome_curso.trim() === '') {
        return res.status(400).json({ error: 'O campo nome_curso é obrigatório.' });
      }

      await db.transaction(async (connection) => {
        const updateQuery = `
          UPDATE curso
          SET nome_curso = ?, descricao_curso = ?
          WHERE id_curso = ?
        `;
        const [result] = await connection.execute(updateQuery, [
          nome_curso,
          descricao_curso || null,
          id
        ]);

        if (result.affectedRows === 0) {
          throw new Error('Curso não encontrado.');
        }
      });

      return res.status(200).json({ message: 'Curso atualizado com sucesso!' });

    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar curso',
        details: error.message
      });
    }
  }

  // ================================
  // DELETE → Remover curso
  // ================================
  else if (req.method === 'DELETE') {
    try {
      await db.transaction(async (connection) => {
        const deleteQuery = 'DELETE FROM curso WHERE id_curso = ?';
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows === 0) {
          throw new Error('Curso não encontrado.');
        }
      });

      return res.status(200).json({ message: 'Curso removido com sucesso!' });

    } catch (error) {
      console.error('Erro ao remover curso:', error);
      return res.status(500).json({
        error: 'Erro ao remover curso',
        details: error.message
      });
    }
  }

  // ================================
  // Método não permitido
  // ================================
  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({
      error: `Método ${req.method} não permitido.`
    });
  }
}
