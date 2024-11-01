// lib/db.js
import mysql from 'mysql2/promise';

class Database {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.config);
    }
    return this.connection;
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'avaliacao',
};

const db = new Database(dbConfig);
export default db;
