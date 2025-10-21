import db from '../../../lib/db.js';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  // ================================
  // POST → Inserir novo curso
  // ================================
  if (req.method === 'POST') {
    try {
      const { nome_curso, descricao_curso } = req.body;

      if (!nome_curso || nome_curso.trim() === '') {
        return res.status(400).json({ error: 'O campo nome_curso é obrigatório.' });
      }

      // Executa a transação usando o método da classe Database
      await db.transaction(async (connection) => {
        const insertQuery = `
          INSERT INTO curso (nome_curso, descricao_curso)
          VALUES (?, ?)
        `;
        await connection.execute(insertQuery, [nome_curso, descricao_curso || null]);
      });

      return res.status(201).json({
        message: 'Curso cadastrado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao inserir curso:', error);
      return res.status(500).json({
        error: 'Erro ao inserir curso',
        details: error.message
      });
    }
  }

  // ================================
  // GET → Listar todos os cursos
  // ================================
  else if (req.method === 'GET') {
    try {
      const query = 'SELECT * FROM curso';
      const rows = await db.execute(query);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar cursos:', error);
      return res.status(500).json({
        error: 'Erro ao listar cursos',
        details: error.message
      });
    }
  }

  // ================================
  // Método não permitido
  // ================================
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      error: `Método ${req.method} não permitido.`
    });
  }
}
