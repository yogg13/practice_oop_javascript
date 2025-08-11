import dotenv from 'dotenv';
dotenv.config();

class DatabaseConfig {
   constructor() {
      this._host = process.env.DB_HOST;
      this._port = parseInt(process.env.DB_PORT);
      this._database = process.env.DB_NAME;
      this._user = process.env.DB_USER;
      this._password = String(process.env.DB_PASSWORD);
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