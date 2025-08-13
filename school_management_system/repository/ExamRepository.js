import BaseRepository from './BaseRepository.js';
import Exam from '../models/Exam.js';

class ExamRepository extends BaseRepository {
   constructor(db) {
      super(db, 'exams');
      this.db = db;
   }

   async getExamById(id) {
      const query = `
         SELECT * FROM exams
         WHERE id = $1
      `;

      const result = await this.db.query(query, [id]);
      if (result.rows.length === 0) return null;

      return result.rows[0];
   }

   async recordExamGrade(examId, studentId, score) {
      // Cek apakah hasil exam sudah ada
      const checkQuery = `
      SELECT * FROM exam_results
      WHERE exam_id = $1 AND student_id = $2
   `;

      const checkResult = await this.db.query(checkQuery, [examId, studentId]);

      if (checkResult.rows.length > 0) {
         // Update hasil exam yang sudah ada
         const updateQuery = `
         UPDATE exam_results
         SET score = $1
         WHERE exam_id = $2 AND student_id = $3
         RETURNING *
      `;

         const updateResult = await this.db.query(updateQuery, [score, examId, studentId]);
         return updateResult.rows[0];
      } else {
         // Buat hasil exam baru
         const insertQuery = `
         INSERT INTO exam_results (exam_id, student_id, score)
         VALUES ($1, $2, $3   )
         RETURNING *
      `;

         const insertResult = await this.db.query(insertQuery, [examId, studentId, score]);
         return insertResult.rows[0];
      }
   }//New added

   async getExamsByCourse(courseId) {
      const query = `
         SELECT * FROM exams
         WHERE course_id = $1
         ORDER BY exam_date
      `;

      const result = await this.db.query(query, [courseId]);
      return result.rows.map(row => this._mapToModel(row));
   }

   async createExam(examData) {
      const examId = this._generateExamId();

      const query = `
         INSERT INTO exams (
            id, title, exam_date, duration, min_score, max_score, 
            exam_type, course_id, status, created_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *
      `;

      const result = await this.db.query(query, [
         examId,
         examData.title,
         examData.date,
         examData.duration,
         examData.minScore || 0,
         examData.maxScore,
         examData.examType || 'exam',
         examData.courseId,
         'scheduled'
      ]);

      return this._mapToModel(result.rows[0]);
   }

   async getResults(examId) {
      const query = `
         SELECT r.*, p.name as student_name
         FROM exam_results r
         JOIN students s ON r.student_id = s.id
         JOIN persons p ON s.id = p.id
         WHERE r.exam_id = $1
      `;

      const result = await this.db.query(query, [examId]);
      return result.rows;
   }

   async recordResult(examId, studentId, score) {
      // Check if result already exists
      const checkQuery = `
         SELECT * FROM exam_results
         WHERE exam_id = $1 AND student_id = $2
      `;

      const checkResult = await this.db.query(checkQuery, [examId, studentId]);

      if (checkResult.rows.length > 0) {
         // Update existing result
         const updateQuery = `
            UPDATE exam_results
            SET score = $1
            WHERE exam_id = $2 AND student_id = $3
            RETURNING *
         `;

         const result = await this.db.query(updateQuery, [
            score, examId, studentId
         ]);

         return result.rows[0];
      } else {
         // Create new result
         const insertQuery = `
            INSERT INTO exam_results (
                  exam_id, student_id, score
            )
            VALUES ($1, $2, $3)
            RETURNING *
         `;

         const result = await this.db.query(insertQuery, [
            examId, studentId, score
         ]);

         return result.rows[0];
      }
   }

   async updateExamStatus(examId, status) {
      const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];

      if (!validStatuses.includes(status)) {
         throw new Error(`Invalid exam status: ${status}`);
      }

      const query = `
         UPDATE exams
         SET status = $1
         WHERE id = $2
         RETURNING *
      `;

      const result = await this.db.query(query, [status, examId]);

      if (result.rows.length === 0) {
         throw new Error(`Exam not found with ID: ${examId}`);
      }

      return this._mapToModel(result.rows[0]);
   }

   _mapToModel(row) {
      const exam = new Exam(
         row.title,
         new Date(row.exam_date),
         row.duration,
         row.min_score,
         row.max_score,
         row.exam_type,
         row.course_id
      );

      // Override the generated ID with the database ID
      exam._id = row.id;
      exam._status = row.status;
      exam._createdAt = row.created_at;

      return exam;
   }

   _generateExamId() {
      const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(8, '5');
      return `EXM-${randomNumber}`;
   }
}

export default ExamRepository;