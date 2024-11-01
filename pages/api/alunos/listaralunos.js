import db from '../../db.js';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await db.connect();
      const [rows] = await connection.execute('SELECT id_aluno, nome, data_nascimento, email, telefone, cpf FROM alunos');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar os alunos', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido :-(' });
  }
}