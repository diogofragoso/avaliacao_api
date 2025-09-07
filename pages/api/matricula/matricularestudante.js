import db from '../../../lib/db.js';
import runMiddleware from '../../../middleware/cors.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    // Chama CORS para todos os métodos, incluindo OPTIONS
    await runMiddleware(req, res);

    // Apenas OPTIONS retorna 200
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      const { id_aluno_fk, nome_aluno, email_aluno, senha_aluno, id_turma } = req.body;

      if (!id_turma) {
        return res.status(400).json({ mensagem: "id_turma é obrigatório." });
      }

      let id_aluno;

      // Aluno existente
      if (id_aluno_fk) {
        id_aluno = parseInt(id_aluno_fk, 10);
      } else {
        // Novo aluno
        if (!nome_aluno || !email_aluno || !senha_aluno) {
          return res.status(400).json({ mensagem: "Para novo aluno, todos os campos são obrigatórios." });
        }

        const [alunoExistente] = await db.execute(
          "SELECT id_aluno FROM aluno WHERE email_aluno = ?",
          [email_aluno]
        );

        if (alunoExistente.length > 0) {
          id_aluno = alunoExistente[0].id_aluno;
        } else {
          const senhaHash = await bcrypt.hash(senha_aluno, 10);
          const [resultadoAluno] = await db.execute(
            "INSERT INTO aluno (nome_aluno, email_aluno, senha_aluno) VALUES (?, ?, ?)",
            [nome_aluno, email_aluno, senhaHash]
          );
          id_aluno = resultadoAluno.insertId;
        }
      }

      // Verifica matrícula existente
      const matriculaExistente = await db.execute(
        "SELECT 1 FROM matricula WHERE id_aluno_fk = ? AND id_turma_fk = ?",
        [id_aluno, id_turma]
      );

      if (matriculaExistente.length > 0) {
        return res.status(400).json({ mensagem: "Aluno já matriculado nesta turma." });
      }

      // Insere matrícula
      await db.execute(
        "INSERT INTO matricula (id_aluno_fk, id_turma_fk) VALUES (?, ?)",
        [id_aluno, id_turma]
      );

      return res.status(201).json({ mensagem: "Matrícula realizada com sucesso!" });
    }

    // Método não permitido
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ mensagem: `Método ${req.method} não permitido` });

  } catch (erro) {
    console.error('Erro ao realizar matrícula:', erro);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar matrícula.', erro: erro.message });
  }
}
