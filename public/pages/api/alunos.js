import mysql from 'mysql2/promise';

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'avaliacao',
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nome, email, mensagem } = req.body;

    // Conectar ao banco de dados
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Inserir dados no banco
      const query = 'INSERT INTO alunos (nome, data_nascimento,email, telefone, cpf, senha) VALUES (?, ?, ?, ?, ?, ?)';
      await connection.execute(query, [nome, email, mensagem]);

      res.status(200).json({ message: 'Dados inseridos com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao inserir dados', details: error.message });
    } finally {
      connection.end();
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
