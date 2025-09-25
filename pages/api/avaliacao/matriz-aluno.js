import db from '../../../lib/db';
import runMiddleware from '../../../middleware/cors';

export default async function handler(req, res) {
    await runMiddleware(req, res);
    const { cursoId, turmaId, alunoId } = req.query;

    if (!cursoId || !turmaId || !alunoId) {
        return res.status(400).json({ error: 'Os parâmetros cursoId, turmaId e alunoId são obrigatórios.' });
    }

    try {
        const [rows] = await db.execute(`
            SELECT 
                c.id_curso, c.nome_curso,
                uc.id_uc, uc.nome_uc, uc.numero_uc,
                i.id_indicador, i.numero_indicador, i.descricao_indicador,
                
                -- Pega a atividade que foi definida para a TURMA neste indicador
                def_turma.id_at_avaliativa_fk AS id_avaliativa_definida,
                
                -- Pega a avaliação específica deste ALUNO
                aluno_av.id_avaliacao,
                aluno_av.mencao
            
            FROM curso c
            
            LEFT JOIN uc ON c.id_curso = uc.id_curso_fk
            LEFT JOIN indicador i ON uc.id_uc = i.id_uc_fk
            
            -- Junta para encontrar a atividade definida para a TURMA
            -- (Assumindo que sua tabela 'avaliacao' guarda essa definição quando 'id_aluno_fk' é NULL)
            LEFT JOIN avaliacao def_turma ON i.id_indicador = def_turma.id_indicador_fk 
                                          AND def_turma.id_turma_fk = ?
                                          AND def_turma.id_aluno_fk IS NULL
            
            -- Junta para encontrar a avaliação já salva do ALUNO
            LEFT JOIN avaliacao aluno_av ON i.id_indicador = aluno_av.id_indicador_fk
                                         AND aluno_av.id_turma_fk = ?
                                         AND aluno_av.id_aluno_fk = ?
            
            WHERE c.id_curso = ?
            ORDER BY uc.numero_uc, i.numero_indicador;
        `, [turmaId, turmaId, alunoId, cursoId]);

        // Estrutura o JSON para o frontend
        const curso = { id_curso: rows[0].id_curso, nome_curso: rows[0].nome_curso, ucs: [] };
        const ucsMap = new Map();
        
        rows.forEach(row => {
            if (row.id_uc && !ucsMap.has(row.id_uc)) {
                ucsMap.set(row.id_uc, { 
                    id_uc: row.id_uc, 
                    nome_uc: row.nome_uc, 
                    numero_uc: row.numero_uc, 
                    indicadores: [] 
                });
            }
        });

        rows.forEach(row => {
            if (row.id_indicador) {
                const uc = ucsMap.get(row.id_uc);
                if (uc && !uc.indicadores.some(ind => ind.id_indicador === row.id_indicador)) {
                    uc.indicadores.push({
                        id_indicador: row.id_indicador,
                        numero_indicador: row.numero_indicador,
                        descricao_indicador: row.descricao_indicador,
                        // Adiciona os dados cruciais para o frontend
                        id_avaliativa_definida: row.id_avaliativa_definida,
                        id_avaliacao: row.id_avaliacao,
                        mencao: row.mencao
                    });
                }
            }
        });
        curso.ucs = Array.from(ucsMap.values());
        res.status(200).json(curso);

    } catch (error) {
        console.error("Erro ao montar matriz do aluno:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
}