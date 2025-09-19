import runMiddleware from '../../../middleware/cors.js';
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { id_turma_fk, id_avaliativa_fk, id_indicador_fk } = req.body;

    if (!id_turma_fk || !id_avaliativa_fk || !id_indicador_fk) {
      return res.status(400).json({ error: 'id_turma_fk, id_avaliativa_fk e id_indicador_fk são obrigatórios.' });
    }

    // ✅ CORREÇÃO DEFINITIVA APLICADA AQUI: Removidos os colchetes de [alunos]
    const alunos = await db.execute(
      `SELECT a.id_aluno 
       FROM matricula m
       JOIN aluno a ON m.id_aluno_fk = a.id_aluno
       WHERE m.id_turma_fk = ?`,
      [id_turma_fk]
    );

    if (!Array.isArray(alunos) || alunos.length === 0) {
      // Esta verificação agora vai funcionar corretamente
      return res.status(404).json({ error: 'Nenhum aluno encontrado para essa turma.' });
    }

    const valores = alunos.map(aluno => [
      aluno.id_aluno,
      id_turma_fk,
      id_avaliativa_fk,
      id_indicador_fk
    ]);

    const placeholders = valores.map(() => '(?, ?, ?, ?)').join(', ');
    const flatValores = valores.flat();
    const query = `
      INSERT INTO avaliacao 
      (id_aluno_fk, id_turma_fk, id_at_avaliativa_fk, id_indicador_fk) 
      VALUES ${placeholders}
    `;
    
    await db.execute(query, flatValores);

    return res.status(201).json({ message: 'Atividade atribuída e avaliações criadas para todos os alunos da turma.' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'Não foi possível salvar, pois a atividade já foi atribuída para esta eturma.' 
      });
    }
    
    console.error('Erro detalhado em /avaliacao/atribuir-turma:', error);
    res.status(500).json({ 
      error: 'Erro no servidor.', 
      details: error.sqlMessage || error.message 
    });
  }
}