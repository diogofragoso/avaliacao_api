// === /pages/api/turmas/editarturma/[id].js ===
import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    const {
      nome_turma,
      periodo_turma,
      max_aluno_turma,
      data_inicio_turma,
      id_curso_fk
    } = req.body;

    // Validações básicas
    if (
      !nome_turma ||
      !periodo_turma ||
      !max_aluno_turma ||
      !data_inicio_turma ||
      !id_curso_fk
    ) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const maxAlunosNum = parseInt(max_aluno_turma, 10);
    const idCursoNum = parseInt(id_curso_fk, 10);

    if (isNaN(maxAlunosNum) || maxAlunosNum <= 0) {
      return res.status(400).json({ error: 'max_aluno_turma deve ser um número positivo.' });
    }
    if (isNaN(idCursoNum) || idCursoNum <= 0) {
      return res.status(400).json({ error: 'id_curso_fk deve ser um número positivo.' });
    }

    const query = `
      UPDATE turma
      SET nome_turma = ?, periodo_turma = ?, max_aluno_turma = ?, data_inicio_turma = ?, id_curso_fk = ?
      WHERE id_turma = ?
    `;

    await db.execute(query, [
      nome_turma,
      periodo_turma,
      maxAlunosNum,
      data_inicio_turma,
      idCursoNum,
      id
    ]);

    res.status(200).json({ message: 'Turma atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao editar turma:', error);
    res.status(500).json({ error: 'Erro ao editar turma', details: error.message });
  }
}
