import mysql from 'mysql2/promise';

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'avaliacao',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Consulta todos os registros da tabela alunos
      const [rows] = await connection.execute('SELECT id_aluno, nome, data_nascimento, email, telefone, cpf FROM alunos');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar os alunos', details: error.message });
    } finally {
      connection.end();
    }
  } else {
    res.status(405).json({ error: 'Método não permitido :-(' });
  }
}
