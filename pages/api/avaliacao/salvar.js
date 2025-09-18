import runMiddleware from '../../../middleware/cors.js';
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { id_turma_fk, id_avaliativa_fk } = req.body;

    if (!id_turma_fk || !id_avaliativa_fk) {
      return res.status(400).json({ error: 'id_turma_fk e id_avaliativa_fk são obrigatórios.' });
    }

    // 🔹 1. Busca a atividade e seu indicador
    const [atividades] = await db.execute(
        `SELECT id_indicador_fk FROM atividade_avaliativa WHERE id_avaliativa = ?`,
        [id_avaliativa_fk]
    );

    // ✨ AJUSTE PRINCIPAL AQUI ✨
    // Primeiro, verificamos se encontramos a atividade.
    const atividadeEncontrada = atividades[0];
    if (!atividadeEncontrada) {
        return res.status(404).json({ error: `Atividade avaliativa com ID ${id_avaliativa_fk} não foi encontrada.` });
    }
    
    // Agora, com segurança, pegamos o indicador e verificamos se ele não é nulo.
    const id_indicador = atividadeEncontrada.id_indicador_fk;
    if (!id_indicador) {
        return res.status(400).json({ error: 'Esta atividade não está associada a nenhum indicador no banco de dados.' });
    }

    // O restante do código permanece o mesmo...

    // 🔹 2. Pega todos os alunos matriculados na turma
    const [alunos] = await db.execute(
      `SELECT a.id_aluno 
       FROM matricula m
       JOIN aluno a ON m.id_aluno_fk = a.id_aluno
       WHERE m.id_turma_fk = ?`,
      [id_turma_fk]
    );

    if (alunos.length === 0) {
      return res.status(404).json({ error: 'Nenhum aluno encontrado para essa turma.' });
    }

    // 🔹 3. Monta os valores para inserir na tabela avaliacao
    const valores = alunos.map(aluno => [
      aluno.id_aluno,
      id_turma_fk,
      id_avaliativa_fk,
      id_indicador,
      null,
      new Date().toISOString().slice(0, 10),
      null
    ]);

    const query = `
      INSERT INTO avaliacao 
      (id_aluno_fk, id_turma_fk, id_avaliativa_fk, id_indicador_fk, mencao, data_avaliacao, observacao_avaliacao) 
      VALUES ?
    `;

    await db.query(query, [valores]);

    return res.status(201).json({ message: 'Atividade atribuída e avaliações criadas para todos os alunos da turma.' });

  } catch (error) {
    console.error('Erro em /avaliacao/atribuir-turma:', error);
    res.status(500).json({ error: 'Erro no servidor.', details: error.message });
  }
}