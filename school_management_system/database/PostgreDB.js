import pg from 'pg';
import DatabaseConfig from "../config/DatabaseConfig.js";

class PostgreDB extends DatabaseConfig {
   constructor(config) {
      super(config);
      this._pool = null;
   }

   async connect() {
      try {
         const { Pool } = pg;
         const config = this.getConfig();
         this._pool = new Pool(config);

         const client = await this._pool.connect();
         console.log(`✅ Connected to PostgreSQL database at ${this.host}:${this.port}/${this.database}`);
         client.release();

         return this._pool;
      } catch (error) {
         console.error('❌ Error connecting to PostgreSQL database:', error.message);
         throw error;
      }
   }

   async disconnect() {
      try {
         if (this._pool) {
            await this._pool.end();
            console.log("✅ Disconnected from PostgreSQL database");
         }
      } catch (error) {
         console.error('❌ Error disconnecting from PostgreSQL database:', error.message);
         throw error;
      }
   }

   async query(text, params = []) {
      if (!this._pool) {
         throw new Error("Database not connected. Call connect() first.");
      }

      try {
         const start = Date.now();
         const result = await this._pool.query(text, params);
         const duration = Date.now() - start;

         console.log(`🔍 Executed query time in ${duration}ms`);
         return result;
      } catch (error) {
         console.error('❌ Query error:', error.message);
         throw error;
      }
   }

   async executeTransaction(callback) {
      if (!this._pool) {
         throw new Error("Database not connected. Call connect() first.");
      }

      const client = await this._pool.connect();

      try {
         await client.query("BEGIN");

         const result = await callback(client);

         await client.query("COMMIT");
         return result;
      } catch (error) {
         await client.query("ROLLBACK");
         console.error('❌ Transaction error:', error.message);
         throw error;
      } finally {
         client.release();
      }
   }
}

export default PostgreDB;
