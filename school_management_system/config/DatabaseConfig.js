import dotenv from 'dotenv';
dotenv.config();

class DatabaseConfig {
   constructor(config = {}) {
      this._host = config.host || process.env.DB_HOST || 'localhost';
      this._port = config.port || process.env.DB_PORT || 5432;
      this._database = config.database || process.env.DB_NAME || 'db_school_management';
      this._user = config.user || process.env.DB_USER || 'postgres';
      this._password = config.password || process.env.DB_PASSWORD || '';
   }

   get host() {
      return this._host;
   }

   get port() {
      return this._port;
   }

   get database() {
      return this._database;
   }

   get user() {
      return this._user;
   }

   get password() {
      return this._password;
   }

   getConnection() {
      return `postgres://${this.user}:${this.password}@${this.host}:${this.port}/${this.database}`;
   }

   getConfig() {
      return {
         host: this._host,
         port: this._port,
         database: this._database,
         user: this._user,
         password: this._password,
      }
   }

}

export default DatabaseConfig;