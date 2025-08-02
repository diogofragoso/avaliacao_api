import db from '../../db.js';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
    await runMiddleware(req, res);

    if (req.method === 'POST') {
        try {
            const {
                nome_turma,
                periodo_turma,
                max_aluno_turma,
                data_inicio_turma,
                id_curso_fk
            } = req.body;

            // Validações básicas no backend:
            if (
                !nome_turma ||
                !periodo_turma ||
                !max_aluno_turma ||
                !data_inicio_turma ||
                !id_curso_fk
            ) {
                return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
            }

            // Validar números
            const maxAlunosNum = parseInt(max_aluno_turma, 10);
            const idCursoNum = parseInt(id_curso_fk, 10);

            if (isNaN(maxAlunosNum) || maxAlunosNum <= 0) {
                return res.status(400).json({ error: 'max_aluno_turma deve ser um número positivo.' });
            }
            if (isNaN(idCursoNum) || idCursoNum <= 0) {
                return res.status(400).json({ error: 'id_curso_fk deve ser um número positivo.' });
            }

            // Log para depuração
            console.log('Dados para inserir turma:', {
                nome_turma,
                periodo_turma,
                max_aluno_turma: maxAlunosNum,
                data_inicio_turma,
                id_curso_fk: idCursoNum
            });

            const query = `
        INSERT INTO turma (nome_turma, periodo_turma, max_aluno_turma, data_inicio_turma, id_curso_fk)
        VALUES (?, ?, ?, ?, ?)
      `;

            const result = await db.execute(query, [
                nome_turma,
                periodo_turma,
                maxAlunosNum,
                data_inicio_turma, // formato 'YYYY-MM-DD'
                idCursoNum
            ]);

            return res.status(200).json({
                message: 'Turma inserida com sucesso',
                id_turma: result.insertId,
                nome_turma,
                periodo_turma,
                max_aluno_turma: maxAlunosNum,
                data_inicio_turma,
                id_curso_fk: idCursoNum
            });
        } catch (error) {
            console.error('Erro ao inserir turma:', error);
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack);
            }
            res.status(500).json({ error: 'Erro ao inserir turma', details: error.message || error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Método ${req.method} não permitido`);
    }
}
