// lib/db.js
import mysql from 'mysql2/promise';

class Database {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }

    async execute(query, params) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    // ✨ NOVO MÉTODO PARA TRANSAÇÕES ✨
    /**
     * Executa uma série de operações dentro de uma transação.
     * @param {Function} callback - Uma função async que recebe a conexão e executa as queries.
     */
    async transaction(callback) {
        // Pega uma conexão exclusiva para a transação
        const connection = await this.pool.getConnection();
        try {
            // Inicia a transação
            await connection.beginTransaction();
            // Executa o seu código (que está no callback)
            await callback(connection);
            // Se tudo deu certo, confirma as alterações
            await connection.commit();
        } catch (error) {
            // Se algo deu errado, desfaz todas as alterações
            await connection.rollback();
            // Propaga o erro para ser tratado na API
            throw error;
        } finally {
            // Libera a conexão de volta para o pool, independentemente do resultado
            connection.release();
        }
    }

    async close() {
        await this.pool.end();
    }
}

// Suas configurações de banco de dados...
const dbConfig = {
    host: '136.248.122.225', // Use suas credenciais corretas
    user: 'diogo',
    password: 'D1234iogo@',
    database: 'avaliacao',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const db = new Database(dbConfig);
export default db;