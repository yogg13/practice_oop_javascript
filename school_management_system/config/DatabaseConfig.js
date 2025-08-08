class DatabaseConfig {
   constructor(config) {
      this._host = config.host || 'localhost';
      this._port = config.port || 5432;
      this._database = config.database || 'db_school_management';
      this._user = config.user || 'admin';
      this._password = config.password || '';
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

}

export default DatabaseConfig;