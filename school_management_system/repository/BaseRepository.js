class BaseRepository {
   constructor(db, tableName) {
      this._db = db;
      this._tableName = tableName;
   }

   async findAll() {
      const query = `SELECT * FROM ${this._tableName}`;
      const result = await this._db.query(query);
      return result.rows;
   }

   async findById(id) {
      const query = `SELECT * FROM ${this._tableName} WHERE id = $1`;
      const result = await this._db.query(query, [id]);
      return result.rows[0];
   }

   async findByField(field, value) {
      const query = `SELECT * FROM ${this._tableName} WHERE ${field} = $1`;
      const result = await this._db.query(query, [value]);
      return result.rows;
   }

   async create(data) {
      const fields = Object.keys(data);
      const values = Object.values(data);

      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const fieldNames = fields.join(', ');

      const query = `INSERT INTO ${this._tableName} (${fieldNames}) 
                     VALUES (${placeholders}) RETURNING *`;

      const result = await this._db.quer(query, values);
      return result.rows[0];
   }

   async update(id, data) {
      const fields = Object.keys(data);
      const values = Object.values(data);

      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

      const query = `UPDATE ${this._tableName} 
                     SET ${setClause}, updated_at = NOW() 
                     WHERE id = $${fields.length + 1} RETURNING *`;

      const result = await this._db.query(query, [...values, id]);
      return result.rows[0];
   }

   async delete(id) {
      const query = `DELETE FROM ${this._tableName} WHERE id = $i RETURNING *`;
      const result = await this._db.query(query, [id]);
      return result.rows[0];
   }
}

export default BaseRepository;