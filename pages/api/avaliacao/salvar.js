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
      return res.status(400).json({ error: 'IDs da turma, atividade e indicador são obrigatórios.' });
    }

    // ✅ A ÚNICA MUDANÇA É AQUI: Removemos os colchetes [ ]
    // Agora, a variável 'alunos' receberá o array completo retornado pelo seu db.execute.
    const alunos = await db.execute(
      `SELECT a.id_aluno 
       FROM matricula m
       JOIN aluno a ON m.id_aluno_fk = a.id_aluno
       WHERE m.id_turma_fk = ?`,
      [id_turma_fk]
    );

    // Esta verificação agora funcionará corretamente.
    if (!Array.isArray(alunos) || alunos.length === 0) {
      return res.status(200).json({ message: 'Atividade associada. A turma não possui alunos para sincronizar no momento.' });
    }

    // O resto da lógica de sincronização com "INSERT IGNORE" permanece a mesma, pois está correta.
    const insertQuery = `
      INSERT IGNORE INTO avaliacao 
      (id_aluno_fk, id_turma_fk, id_at_avaliativa_fk, id_indicador_fk, data_avaliacao) 
      VALUES (?, ?, ?, ?, CURDATE())
    `;

    const insertPromises = alunos.map(aluno => 
      db.execute(insertQuery, [aluno.id_aluno, id_turma_fk, id_avaliativa_fk, id_indicador_fk])
    );

    await Promise.all(insertPromises);

    return res.status(200).json({ message: 'Atividade associada e alunos sincronizados com sucesso!' });

  } catch (error) {
    console.error('Erro detalhado em /avaliacao/salvar:', error);
    res.status(500).json({ 
      error: 'Erro no servidor ao sincronizar avaliações.', 
      details: error.message 
    });
  }
}