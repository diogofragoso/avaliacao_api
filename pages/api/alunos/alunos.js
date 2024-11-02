import db from '../../db.js';
import runMiddleware from '../../../middleware/cors.js'; // Importa a função para rodar o middleware CORS

export default async function handler(req, res) {
  // Executa o middleware CORS
  await runMiddleware(req, res);

  if (req.method === 'POST') {
    const { nome, data_nascimento, email, telefone, cpf, senha } = req.body;

    // Conectar ao banco de dados
    const connection = await db.connect();
    console.log('Conexão com o banco de dados estabelecida #########################');

    try {
      // Inserir dados no banco
      const query = 'INSERT INTO alunos (nome, data_nascimento, email, telefone, cpf, senha) VALUES (?, ?, ?, ?, ?, ?)';
      await connection.execute(query, [nome, data_nascimento, email, telefone, cpf, senha]);

      res.status(200).json({ message: 'Dados inseridos com sucesso!' });
    } catch (error) {
      console.error('Erro ao inserir dados:', error); // Log do erro
      res.status(500).json({ error: 'Erro ao inserir dados', details: error.message });
    } finally {
      // Fechar a conexão com o banco
      if (connection) {
        await connection.end();
      }
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
