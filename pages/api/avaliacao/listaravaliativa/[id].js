// /pages/api/avaliacao/listaravaliativa/[id].js

import runMiddleware from '../../../../middleware/cors.js';
import db from '../../../../lib/db.js';

export default async function handler(req, res) {
  // Habilita CORS
  await runMiddleware(req, res);

  // Só aceita GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Pega o id do curso da URL
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID do curso é obrigatório' });
  }

  try {
    // 1️⃣ Buscar curso + UCs
    const queryCurso = `
      SELECT 
        c.id_curso,
        c.nome_curso,
        c.descricao_curso,
        uc.id_uc,
        uc.nome_uc,
        uc.numero_uc
      FROM curso c
      LEFT JOIN uc ON uc.id_curso_fk = c.id_curso
      WHERE c.id_curso = ?
      ORDER BY uc.numero_uc
    `;
    const cursoRows = await db.execute(queryCurso, [id]);

    if (!cursoRows.length) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    // Extrair UCs sem duplicar
    const ucs = cursoRows
      .map(row => ({
        id_uc: row.id_uc,
        nome_uc: row.nome_uc,
        numero_uc: row.numero_uc
      }))
      .filter((uc, index, self) => 
        index === self.findIndex(t => t.id_uc === uc.id_uc)
      );

    // 2️⃣ Buscar indicadores
    const queryIndicadores = `
      SELECT 
        uc.id_uc,
        i.id_indicador,
        i.numero_indicador,
        i.descricao_indicador
      FROM uc
      JOIN indicador i ON i.id_uc_fk = uc.id_uc
      WHERE uc.id_curso_fk = ?
      ORDER BY uc.numero_uc, i.numero_indicador
    `;
    const indicadoresRows = await db.execute(queryIndicadores, [id]);

    const indicadoresPorUc = indicadoresRows.reduce((acc, i) => {
      const { id_uc, id_indicador, numero_indicador, descricao_indicador } = i;
      if (!acc[id_uc]) {
        acc[id_uc] = [];
      }
      acc[id_uc].push({ id_indicador, numero_indicador, descricao_indicador });
      return acc;
    }, {});

    // 3️⃣ Buscar avaliativas
    const queryAvaliativas = `
      SELECT 
        a.id_avaliativa,
        a.descricao_avaliativa,
        a.id_indicador_fk
      FROM atividade_avaliativa a
      JOIN indicador i ON i.id_indicador = a.id_indicador_fk
      JOIN uc u ON u.id_uc = i.id_uc_fk
      WHERE u.id_curso_fk = ?
      ORDER BY u.numero_uc, i.numero_indicador, a.id_avaliativa
    `;
    const avaliativasRows = await db.execute(queryAvaliativas, [id]);

    const avaliativasPorIndicador = avaliativasRows.reduce((acc, a) => {
      const { id_avaliativa, descricao_avaliativa, id_indicador_fk } = a;
      if (!acc[id_indicador_fk]) {
        acc[id_indicador_fk] = [];
      }
      acc[id_indicador_fk].push({ id_avaliativa, descricao_avaliativa });
      return acc;
    }, {});

    // 4️⃣ Montar resposta final
    const cursoData = {
      id_curso: cursoRows[0].id_curso,
      nome_curso: cursoRows[0].nome_curso,
      descricao_curso: cursoRows[0].descricao_curso,
      ucs: ucs.map(uc => ({
        ...uc,
        indicadores: (indicadoresPorUc[uc.id_uc] || []).map(indicador => ({
          ...indicador,
          avaliativas: avaliativasPorIndicador[indicador.id_indicador] || [],
          total_avaliativas: (avaliativasPorIndicador[indicador.id_indicador] || []).length
        })),
        total_indicadores: (indicadoresPorUc[uc.id_uc] || []).length
      })),
      total_ucs: ucs.length
    };

    res.status(200).json(cursoData);

  } catch (error) {
    console.error('Erro ao listar curso com UCs, indicadores e avaliativas:', error);
    res.status(500).json({
      error: 'Erro ao listar curso com UCs, indicadores e avaliativas',
      details: error.message,
    });
  }
}
