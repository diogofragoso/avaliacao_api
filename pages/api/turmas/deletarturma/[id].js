import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res); // Executa o CORS

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID da turma não fornecido' });
    }

    try {
      const idNumber = Number(id);
      console.log('ID recebido para deleção da turma:', idNumber);

      console.log('Executando a deleção da turma com ID:', idNumber);
      const result = await db.execute(
        'DELETE FROM turma WHERE id_turma = ?',
        [idNumber]
      );

      console.log('Resultado da deleção:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      return res.status(200).json({ message: 'Turma deletada com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar turma:', error);
      return res.status(500).json({ error: 'Erro ao deletar turma', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'OPTIONS']);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }
}
