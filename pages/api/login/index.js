// pages/api/login.js
import db from '../../../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import runMiddleware from '../../../middleware/cors.js';

export default async function handler(req, res) {
  // Executa middleware CORS
  await runMiddleware(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // 🔍 Busca usuário (case-insensitive e trim)
    const rows = await db.execute(
      'SELECT id_usuario, nome_usuario, email_usuario, senha_usuario, tipo_usuario_fk FROM usuario WHERE LOWER(TRIM(email_usuario)) = LOWER(TRIM(?))',
      [email]
    );

    if (!rows || rows.length === 0) {
      // Mensagem genérica para segurança
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = rows[0];

    // 🔑 Compara senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_usuario);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 🔐 Gera token JWT (8 horas)
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        nome: usuario.nome_usuario,
        email: usuario.email_usuario,
        tipo_usuario_fk: usuario.tipo_usuario_fk,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 🍪 Define cookie HttpOnly
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Strict`);

    // Retorna usuário (sem senha) e token
    return res.status(200).json({
      message: 'Login bem-sucedido!',
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome_usuario,
        email: usuario.email_usuario,
        tipo_usuario_fk: usuario.tipo_usuario_fk,
      },
      token,
    });

  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro interno no login', details: error.message });
  }
}
