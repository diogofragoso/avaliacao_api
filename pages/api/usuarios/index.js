// pages/api/usuarios/index.js

import db from '../../../lib/db.js'; // A importação continua a mesma
import runMiddleware from '../../../middleware/cors.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    await runMiddleware(req, res);

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { nome, email, senha, tipo_usuario, numero_matricula, departamento } = req.body;

        if (!nome || !email || !senha || !tipo_usuario) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes: nome, email, senha, tipo_usuario' });
        }

        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);
        const id_tipo = tipo_usuario.toLowerCase() === 'aluno' ? 1 : 2;

        // Executa toda a lógica de inserção dentro da transação
        await db.transaction(async (connection) => {
            // Query 1: Inserir na tabela 'usuario'
            const usuarioQuery = `
                INSERT INTO usuario 
                (nome_usuario, email_usuario, senha_usuario, tipo_usuario_fk, data_cadastro_usuario) 
                VALUES (?, ?, ?, ?, NOW())
            `;
            const [usuarioResult] = await connection.execute(usuarioQuery, [nome, email, senha_hash, id_tipo]);
            const newUserId = usuarioResult.insertId;

            // Query 2: Inserir na tabela específica ('aluno' or 'professor')
            if (tipo_usuario.toLowerCase() === 'aluno') {
                if (!numero_matricula) {
                    // Lançar um erro aqui fará a transação ser revertida automaticamente
                    throw new Error('Número de matrícula é obrigatório para o aluno.');
                }
                const alunoQuery = 'INSERT INTO aluno (id_usuario_fk, numero_matricula) VALUES (?, ?)';
                await connection.execute(alunoQuery, [newUserId, numero_matricula]);
            } else if (tipo_usuario.toLowerCase() === 'professor') {
                const professorQuery = 'INSERT INTO professor (id_usuario_fk, departamento) VALUES (?, ?)';
                await connection.execute(professorQuery, [newUserId, departamento || null]);
            } else {
                throw new Error('Tipo de usuário inválido.');
            }
        });

        res.status(201).json({ message: 'Usuário criado com sucesso!' });

    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
        }

        // Se o erro foi o que lançamos (ex: falta de matrícula), usa a mensagem dele
        if (error.message.includes('Número de matrícula') || error.message.includes('Tipo de usuário inválido')) {
             return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
    }
}