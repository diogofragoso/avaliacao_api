import db from '../../../lib/db.js';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
  // Executa o middleware de CORS
  await runMiddleware(req, res);

  const { method } = req;

  switch (method) {
    // ROTA PARA BUSCAR AS AVALIAÇÕES FINAIS DE UM ALUNO EM UMA TURMA
    case 'GET':
      try {
        const { id_aluno, id_turma } = req.query;

        if (!id_aluno || !id_turma) {
          return res.status(400).json({ error: 'id_aluno e id_turma são obrigatórios.' });
        }

        const query = `
          SELECT id_uc_fk, mencao_final, feedback_final
          FROM avaliacao_final_uc
          WHERE id_aluno_fk = ? AND id_turma_fk = ?
        `;
        const results = await db.execute(query, [id_aluno, id_turma]);
        
        res.status(200).json(results);
      } catch (error) {
        console.error('Erro ao buscar dados da avaliação final:', error);
        res.status(500).json({ error: 'Erro no servidor ao buscar dados', details: error.message });
      }
      break;

    // ROTA PARA SALVAR (INSERIR OU ATUALIZAR) UMA AVALIAÇÃO FINAL
    case 'POST':
      try {
        const { id_aluno_fk, id_turma_fk, id_uc_fk, mencao_final, feedback_final } = req.body;

        if (!id_aluno_fk || !id_turma_fk || !id_uc_fk) {
          return res.status(400).json({ error: 'id_aluno_fk, id_turma_fk e id_uc_fk são obrigatórios.' });
        }

        // 1. Verifica se já existe um registro para essa combinação
        const checkQuery = `
          SELECT id_avaliacao_final FROM avaliacao_final_uc
          WHERE id_aluno_fk = ? AND id_turma_fk = ? AND id_uc_fk = ?
        `;
        const existing = await db.execute(checkQuery, [id_aluno_fk, id_turma_fk, id_uc_fk]);

        if (existing.length > 0) {
          // 2. Se EXISTE, faz o UPDATE
          const id = existing[0].id_avaliacao_final;
          
          // Monta a query de update dinamicamente para não sobrescrever com null
          let setClauses = [];
          let params = [];
          if (mencao_final !== undefined) {
            setClauses.push('mencao_final = ?');
            params.push(mencao_final);
          }
          if (feedback_final !== undefined) {
            setClauses.push('feedback_final = ?');
            params.push(feedback_final);
          }
          
          // Se não veio nem menção nem feedback, não faz nada
          if(setClauses.length === 0) {
              return res.status(200).json({ message: 'Nenhum dado para atualizar.' });
          }

          params.push(id); // Adiciona o ID para o WHERE
          
          const updateQuery = `UPDATE avaliacao_final_uc SET ${setClauses.join(', ')} WHERE id_avaliacao_final = ?`;
          await db.execute(updateQuery, params);
          
          res.status(200).json({ message: 'Avaliação final atualizada com sucesso!' });

        } else {
          // 3. Se NÃO EXISTE, faz o INSERT
          const insertQuery = `
            INSERT INTO avaliacao_final_uc 
            (id_aluno_fk, id_turma_fk, id_uc_fk, mencao_final, feedback_final, data_fechamento) 
            VALUES (?, ?, ?, ?, ?, CURDATE())
          `;
          await db.execute(insertQuery, [id_aluno_fk, id_turma_fk, id_uc_fk, mencao_final || null, feedback_final || '']);

          res.status(201).json({ message: 'Avaliação final criada com sucesso!' });
        }

      } catch (error) {
        console.error('Erro ao salvar avaliação final:', error);
        res.status(500).json({ error: 'Erro no servidor ao salvar dados', details: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Método ${method} não permitido`);
  }
}