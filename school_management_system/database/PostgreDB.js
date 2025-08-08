import DatabaseConfig from "../config/DatabaseConfig.js";

class PostgreDB extends DatabaseConfig {
   constructor(config) {
      super(config);
   }

   connect() {
      // Logic to connect to PostgreSQL database
      try {
         const connectionString = this.getConnection();
         // Use a PostgreSQL client library to connect
         console.log(`Connecting to PostgreSQL database at ${connectionString}`);
         // Example: const client = new Client({ connectionString });
         // await client.connect();
         // return client;
      } catch (error) {
         console.error('Error connecting to PostgreSQL database:', error.message);
      }
   }

   disconnect() {
      // Logic to disconnect from PostgreSQL database
      try {
         // Example: await client.end();
         console.log('Disconnected from PostgreSQL database');
      } catch (error) {
         console.error('Error disconnecting from PostgreSQL database:', error.message);
      }
   }
}

export default PostgreDB;
