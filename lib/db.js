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

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await callback(connection);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

// ✅ Usa instância global no modo dev para evitar ECONNRESET
const dbConfig = {
  host: '136.248.122.225',
  user: 'diogo',
  password: 'D1234iogo@',
  database: 'avaliacao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let db;

if (!global._db) {
  global._db = new Database(dbConfig);
}
db = global._db;

export default db;
