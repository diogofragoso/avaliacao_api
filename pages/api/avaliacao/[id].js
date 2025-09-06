import runMiddleware from '../../../middleware/cors.js';
import db from '../../db.js';

export default async function handler(req, res) {
  // Habilita o CORS para permitir requisições de outras origens
  await runMiddleware(req, res);

  // Garante que a rota só responda a requisições GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // O Next.js agora captura o 'id' da URL dinâmica
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID do curso é obrigatório' });
  }

  try {
    // Consulta 1: Retorna o curso e suas UCs, ordenadas pelo número da UC
    const queryCurso = `
      SELECT 
        c.id_curso,
        c.nome_curso,
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

    // Mapeia as UCs para um array de objetos, removendo duplicatas e mantendo a ordem
    const ucs = cursoRows.map(row => ({
      id_uc: row.id_uc,
      nome_uc: row.nome_uc,
      numero_uc: row.numero_uc
    })).filter((uc, index, self) => 
      index === self.findIndex(t => t.id_uc === uc.id_uc)
    );

    // Consulta 2: Retorna todos os indicadores para as UCs do curso, ordenados pelo número do indicador
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

    // Organiza os indicadores por UC em um objeto para fácil acesso
    const indicadoresPorUc = indicadoresRows.reduce((acc, indicador) => {
      const { id_uc, id_indicador, numero_indicador, descricao_indicador } = indicador;
      if (!acc[id_uc]) {
        acc[id_uc] = [];
      }
      acc[id_uc].push({ id_indicador, numero_indicador, descricao_indicador });
      return acc;
    }, {});

    // Combina os resultados: para cada UC, adiciona a lista de seus indicadores
    const cursoData = {
      id_curso: cursoRows[0].id_curso,
      nome_curso: cursoRows[0].nome_curso,
      ucs: ucs.map(uc => ({
        ...uc,
        indicadores: indicadoresPorUc[uc.id_uc] || [],
        total_indicadores: indicadoresPorUc[uc.id_uc]?.length || 0
      })),
      total_ucs: ucs.length
    };
    
    // Retorna o objeto completo com os detalhes das UCs e indicadores
    res.status(200).json(cursoData);

  } catch (error) {
    console.error('Erro ao listar curso com UCs e indicadores:', error);
    res.status(500).json({
      error: 'Erro ao listar curso com UCs e indicadores',
      details: error.message,
    });
  }
}
