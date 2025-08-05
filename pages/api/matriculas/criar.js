import db from '../../../db.js';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
  await runMiddleware(req, res);

  if (req.method === 'POST') {
    const {
      nome_aluno,
      email_aluno,
      senha_aluno,
      id_curso,
      id_turma
    } = req.body;

    try {
      // Verifica se o aluno já existe pelo e-mail
      const [alunoExistente] = await db.query(
        'SELECT id_aluno FROM aluno WHERE email_aluno = ?',
        [email_aluno]
      );

      let id_aluno;

      if (alunoExistente.length > 0) {
        // Aluno já existe
        id_aluno = alunoExistente[0].id_aluno;
      } else {
        // Insere o novo aluno
        const resultadoAluno = await db.query(
          'INSERT INTO aluno (nome_aluno, email_aluno, senha_aluno) VALUES (?, ?, ?)',
          [nome_aluno, email_aluno, senha_aluno]
        );
        id_aluno = resultadoAluno[0].insertId;
      }

      // Verifica se já existe matrícula
      const [matriculaExistente] = await db.query(
        'SELECT * FROM matricula WHERE id_aluno_fk = ? AND id_turma_fk = ?',
        [id_aluno, id_turma]
      );

      if (matriculaExistente.length > 0) {
        return res.status(400).json({ mensagem: 'Aluno já matriculado nesta turma.' });
      }

      // Realiza a matrícula
      await db.query(
        'INSERT INTO matricula (id_aluno_fk, id_curso_fk, id_turma_fk) VALUES (?, ?, ?)',
        [id_aluno, id_curso, id_turma]
      );

      return res.status(201).json({ mensagem: 'Matrícula realizada com sucesso!' });
    } catch (erro) {
      console.error('Erro ao realizar matrícula:', erro);
      return res.status(500).json({ mensagem: 'Erro interno ao realizar matrícula.' });
    }
  } else {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }
}
