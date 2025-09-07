import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js'; // Corrigindo o caminho para o arquivo de conexão com o banco de dados

export default async function handler(req, res) {
  await runMiddleware(req, res); // Garante que o CORS será executado antes

  if (req.method === 'PUT') {
    const { id } = req.query; // ID do indicador a ser editado
    const { numero_indicador, descricao_indicador } = req.body; // Dados do indicador a serem atualizados

    if (!id || !numero_indicador || !descricao_indicador) {
      return res.status(400).json({ error: 'Dados incompletos para edição' });
    }

    try {
      // A consulta SQL para atualizar o indicador com o ID informado
      const result = await db.execute(
        'UPDATE indicador SET numero_indicador = ?, descricao_indicador = ? WHERE id_indicador = ?',
        [numero_indicador, descricao_indicador, Number(id)]
      );

      console.log('ID recebido para edição:', id);
      console.log('Resultado da edição:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Indicador não encontrado' });
      }

      return res.status(200).json({ message: 'Indicador editado com sucesso!' });
    } catch (error) {
      console.error('Erro ao editar indicador:', error);
      return res.status(500).json({ error: 'Erro ao editar indicador', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' }); // Para métodos diferentes de PUT
  }
}
