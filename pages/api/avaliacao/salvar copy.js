import runMiddleware from '../../../middleware/cors.js';
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Assumindo que o endpoint 'salvar' também precisa de um id_turma_fk
    const { id_turma_fk, id_avaliativa_fk, id_indicador_fk /* ...outros campos... */ } = req.body;

    if (!id_turma_fk || !id_avaliativa_fk || !id_indicador_fk) {
      return res.status(400).json({ error: 'Campos obrigatórios estão faltando.' });
    }

    // ✅ CORREÇÃO PRINCIPAL AQUI:
    // Adicionamos [alunos] para desestruturar o resultado da query.
    // O db.execute retorna [rows, fields], então [alunos] pega apenas o array de 'rows'.
    const alunos = await db.execute(
      `SELECT a.id_aluno 
       FROM matricula m
       JOIN aluno a ON m.id_aluno_fk = a.id_aluno
       WHERE m.id_turma_fk = ?`,
      [id_turma_fk]
    );

    // Esta verificação agora funcionará corretamente.
    if (!Array.isArray(alunos) || alunos.length === 0) {
      return res.status(404).json({ error: 'Nenhum aluno encontrado para esta turma.' });
    }

    // ... O resto da sua lógica para salvar a avaliação ...
    // Por exemplo, montar os valores e a query INSERT.

    const valores = alunos.map(aluno => [
      aluno.id_aluno,
      id_turma_fk,
      id_avaliativa_fk,
      id_indicador_fk,
      '' // Valor padrão para acao_recuperacao
    ]);

    const placeholders = valores.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const flatValores = valores.flat();
    const query = `
      INSERT INTO avaliacao 
      (id_aluno_fk, id_turma_fk, id_at_avaliativa_fk, id_indicador_fk, acao_recuperacao) 
      VALUES ${placeholders}
    `;
    
    await db.execute(query, flatValores);

    return res.status(201).json({ message: 'Avaliações salvas com sucesso para todos os alunos.' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'Não foi possível salvar, pois esta atividade já foi atribuída para esta turma.' 
      });
    }
    
    console.error('Erro detalhado em /avaliacao/salvar:', error);
    res.status(500).json({ 
      error: 'Erro no servidor.', 
      details: error.sqlMessage || error.message 
    });
  }
}