// Caminho: /pages/api/avaliacao/listarselecionadas/[idIndicador].js
import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js';

export default async function handler(req, res) {
  // Habilita CORS
  await runMiddleware(req, res);

  // Aceita apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { idIndicador } = req.query;
  if (!idIndicador) {
    return res.status(400).json({ error: 'ID do indicador é obrigatório' });
  }

  try {
    // Consulta atividades avaliativas selecionadas para esse indicador
    const query = `
      SELECT 
        av.id_avaliacao,
        av.id_aluno_fk,
        av.id_turma_fk,
        av.id_at_avaliativa_fk,
        atv.descricao_avaliativa,
        av.id_indicador_fk,
        i.numero_indicador,
        i.descricao_indicador,
        av.data_avaliacao,
        av.mencao,
        av.observacao_avaliacao,
        av.acao_recuperacao
      FROM avaliacao av
      JOIN atividade_avaliativa atv 
        ON atv.id_avaliativa = av.id_at_avaliativa_fk
      JOIN indicador i 
        ON i.id_indicador = av.id_indicador_fk
      WHERE av.id_indicador_fk = ?
      ORDER BY av.id_avaliacao DESC
    `;

    const rows = await db.execute(query, [idIndicador]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Nenhuma atividade avaliativa encontrada para este indicador' });
    }

    res.status(200).json({
      id_indicador: idIndicador,
      total: rows.length,
      avaliativas: rows.map(r => ({
        id_avaliacao: r.id_avaliacao,
        id_aluno: r.id_aluno_fk,
        id_turma: r.id_turma_fk,
        id_at_avaliativa: r.id_at_avaliativa_fk,
        descricao_avaliativa: r.descricao_avaliativa,
        numero_indicador: r.numero_indicador,
        descricao_indicador: r.descricao_indicador,
        data_avaliacao: r.data_avaliacao,
        mencao: r.mencao,
        observacao: r.observacao_avaliacao,
        acao_recuperacao: r.acao_recuperacao      
      }))
    });

  } catch (error) {
    console.error('Erro ao listar avaliativas selecionadas:', error);
    res.status(500).json({
      error: 'Erro ao listar avaliativas selecionadas',
      details: error.message,
    });
  }
}
