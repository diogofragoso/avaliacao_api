import runMiddleware from '../../../middleware/cors.js';
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 1. Recebe todos os IDs necessários do corpo da requisição.
    const { id_turma_fk, id_avaliativa_fk, id_indicador_fk } = req.body;

    if (!id_turma_fk || !id_avaliativa_fk || !id_indicador_fk) {
      return res.status(400).json({ error: 'id_turma_fk, id_avaliativa_fk e id_indicador_fk são obrigatórios.' });
    }

    // 2. Busca todos os alunos da turma especificada.
    const alunos = await db.execute(
      `SELECT a.id_aluno 
       FROM matricula m
       JOIN aluno a ON m.id_aluno_fk = a.id_aluno
       WHERE m.id_turma_fk = ?`,
      [id_turma_fk]
    );

    if (!Array.isArray(alunos)) {
        console.error("Resultado inesperado do banco de dados. Não é um array:", alunos);
        return res.status(500).json({ error: 'Erro no servidor ao processar a lista de alunos.' });
    }

    if (alunos.length === 0) {
      return res.status(404).json({ error: 'Nenhum aluno encontrado para essa turma.' });
    }

    // 3. Prepara os dados para a inserção em lote (bulk insert).
    
    // Monta um array de arrays, com os 4 valores necessários para cada aluno.
    const valores = alunos.map(aluno => [
      aluno.id_aluno,
      id_turma_fk,
      id_avaliativa_fk,
      id_indicador_fk
    ]);

    // Cria os placeholders "(?, ?, ?, ?)" para cada linha a ser inserida.
    const placeholders = valores.map(() => '(?, ?, ?, ?)').join(', ');
    
    // "Achata" (flat) o array de valores em uma única lista para o db.execute.
    const flatValores = valores.flat();

    // Monta a query final de inserção em lote, com as 4 colunas.
    const query = `
      INSERT INTO avaliacao 
      (id_aluno_fk, id_turma_fk, id_at_avaliativa_fk, id_indicador_fk) 
      VALUES ${placeholders}
    `;
    
    // 4. Executa a query de inserção em lote de forma segura.
    await db.execute(query, flatValores);

    return res.status(201).json({ message: 'Atividade atribuída e avaliações criadas para todos os alunos da turma.' });

  } catch (error) {
    // 5. Captura qualquer erro que possa ocorrer no processo.
    console.error('Erro detalhado em /avaliacao/atribuir-turma:', error);
    res.status(500).json({ error: 'Erro no servidor.', details: error.sqlMessage || error.message });
  }
}