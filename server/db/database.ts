import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbInstance: Database | null = null;

export const db = {
  async getDb() {
    if (!dbInstance) {
      dbInstance = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
      });
    }
    return dbInstance;
  },

  async run(sql: string, params: any[] = []) {
    const instance = await this.getDb();
    return instance.run(sql, params);
  },

  async all(sql: string, params: any[] = []) {
    const instance = await this.getDb();
    return instance.all(sql, params);
  },

  async get(sql: string, params: any[] = []) {
    const instance = await this.getDb();
    return instance.get(sql, params);
  }
};
