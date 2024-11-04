import mysql from 'mysql2/promise';

class Database {
  constructor(config) {
    this.pool = mysql.createPool(config); // Utiliza um pool ao invés de conexão única
  }

  async execute(query, params) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release(); // Garante que a conexão é liberada para o pool após o uso
    }
  }

  async close() {
    await this.pool.end();
  }
}

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'avaliacao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const db = new Database(dbConfig);
export default db;
