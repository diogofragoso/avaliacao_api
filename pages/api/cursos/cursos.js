// pages/api/usuarios/index.js

import db from '../../../lib/db.js'; // MUDANÇA AQUI: Usando 'db' como no seu exemplo
import runMiddleware from '../../../middleware/cors.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    await runMiddleware(req, res);

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // A conexão é obtida do pool para podermos usar a transação
    let connection;

    try {
        const { nome, email, senha, tipo_usuario, numero_matricula, departamento } = req.body;

        if (!nome || !email || !senha || !tipo_usuario) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes: nome, email, senha, tipo_usuario' });
        }

        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        // Iniciar a transação no banco de dados
        connection = await db.getConnection(); // MUDANÇA AQUI: Usando 'db'
        await connection.beginTransaction();

        const usuarioQuery = `
            INSERT INTO usuario 
            (nome_usuario, email_usuario, senha_usuario, tipo_usuario_fk, data_cadastro_usuario) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        const id_tipo = tipo_usuario.toLowerCase() === 'aluno' ? 1 : 2;

        const [usuarioResult] = await connection.execute(usuarioQuery, [nome, email, senha_hash, id_tipo]);
        const newUserId = usuarioResult.insertId;

        if (tipo_usuario.toLowerCase() === 'aluno') {
            if (!numero_matricula) {
                await connection.rollback();
                return res.status(400).json({ error: 'Número de matrícula é obrigatório para o aluno.' });
            }
            const alunoQuery = 'INSERT INTO aluno (id_usuario_fk, numero_matricula) VALUES (?, ?)';
            await connection.execute(alunoQuery, [newUserId, numero_matricula]);
        } 
        else if (tipo_usuario.toLowerCase() === 'professor') {
            const professorQuery = 'INSERT INTO professor (id_usuario_fk, departamento) VALUES (?, ?)';
            await connection.execute(professorQuery, [newUserId, departamento || null]);
        }
        else {
             await connection.rollback();
             return res.status(400).json({ error: 'Tipo de usuário inválido.' });
        }
        
        await connection.commit();

        res.status(201).json({ message: 'Usuário criado com sucesso!', userId: newUserId });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Erro ao inserir usuário:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
        }

        res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });

    } finally {
        if (connection) {
            connection.release();
        }
    }
}