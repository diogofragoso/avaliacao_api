import runMiddleware from '../../../middleware/cors.js';
import db from '../../../lib/db.js'; // Ajuste conforme sua estrutura

export default async function handler(req, res) {
  await runMiddleware(req, res);  // Executa o CORS

  if (req.method === 'POST') {
    const { descricao, id_indicador_fk } = req.body;  // Recebendo os dados do corpo da requisição

    if (!descricao || !id_indicador_fk) {
      return res.status(400).json({ error: 'Descrição e ID da UC são obrigatórios' });
    }

    try {
      // Inserindo a nova atividade no banco de dados
      const result = await db.execute(
        'INSERT INTO atividade_avaliativa (descricao_avaliativa, id_indicador_fk) VALUES (?, ?)',
        [descricao, id_indicador_fk]
      );

      console.log('Resultado da inserção:', result);

      return res.status(201).json({ message: 'Atividade criada com sucesso!', id_avaliativa: result.insertId });
    } catch (error) {
      console.error('Erro ao inserir atividade:', error);
      return res.status(500).json({ error: 'Erro ao inserir atividade', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
