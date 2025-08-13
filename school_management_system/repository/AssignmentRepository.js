import BaseRepository from './BaseRepository.js';
import Assignment from '../models/Assignment.js';

class AssignmentRepository extends BaseRepository {
   constructor(db) {
      super(db, 'assignments');
      this.db = db;
   }

   async getAssignmentById(id) {
      const query = `
         SELECT * FROM assignments
         WHERE id = $1
      `;

      const result = await this.db.query(query, [id]);
      if (result.rows.length === 0) return null;

      return this._mapToModel(result.rows[0]);
   }

   async getAssignmentsByCourse(courseId) {
      const query = `
         SELECT * FROM assignments
         WHERE course_id = $1
         ORDER BY due_date
      `;

      const result = await this.db.query(query, [courseId]);
      return result.rows.map(row => this._mapToModel(row));
   }

   async createAssignment(assignmentData) {
      const assignmentId = this._generateAssignmentId();

      const query = `
         INSERT INTO assignments (
            id, title, description, due_date, min_score, max_score, 
            type, course_id, status, created_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *
      `;

      const result = await this.db.query(query, [
         assignmentId,
         assignmentData.title,
         assignmentData.description,
         assignmentData.dueDate,
         assignmentData.minScore || 0,
         assignmentData.maxScore,
         assignmentData.type || 'assignment',
         assignmentData.courseId,
         'active'
      ]);

      return this._mapToModel(result.rows[0]);
   }

   async getSubmissions(assignmentId) {
      const query = `
         SELECT s.*, p.name as student_name
         FROM assignment_submissions s
         JOIN students st ON s.student_id = st.id
         JOIN persons p ON st.id = p.id
         WHERE s.assignment_id = $1
      `;

      const result = await this.db.query(query, [assignmentId]);
      return result.rows;
   }

   async submitAssignment(assignmentId, studentId, content) {
      // Check if submission already exists
      const checkQuery = `
         SELECT * FROM assignment_submissions
         WHERE assignment_id = $1 AND student_id = $2
      `;

      const checkResult = await this.db.query(checkQuery, [assignmentId, studentId]);

      if (checkResult.rows.length > 0) {
         // Update existing submission
         const updateQuery = `
            UPDATE assignment_submissions
            SET content = $1, submitted_at = NOW()
            WHERE assignment_id = $2 AND student_id = $3
            RETURNING *
         `;

         const result = await this.db.query(updateQuery, [content, assignmentId, studentId]);
         return result.rows[0];
      } else {
         // Get assignment due date to check if late
         const assignmentQuery = `
            SELECT due_date FROM assignments
            WHERE id = $1
         `;

         const assignmentResult = await this.db.query(assignmentQuery, [assignmentId]);
         const dueDate = new Date(assignmentResult.rows[0].due_date);
         const now = new Date();
         const isLate = now > dueDate;

         // Create new submission
         const insertQuery = `
            INSERT INTO assignment_submissions (
               assignment_id, student_id, content, submitted_at, is_late, status
            )
            VALUES ($1, $2, $3, NOW(), $4, 'submitted')
            RETURNING *
         `;

         const result = await this.db.query(insertQuery, [assignmentId, studentId, content, isLate]);
         return result.rows[0];
      }
   }

   async getStudentSubmission(assignmentId, studentId) {
      const query = `
      SELECT * FROM assignment_submissions
      WHERE assignment_id = $1 AND student_id = $2
   `;

      const result = await this.db.query(query, [assignmentId, studentId]);
      return result.rows[0];
   }// New added

   async createSubmission(submissionData) {
      const query = `
      INSERT INTO assignment_submissions 
      (assignment_id, student_id, content, submitted_at, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
   `;

      const values = [
         submissionData.assignment_id,
         submissionData.student_id,
         submissionData.content,
         submissionData.submitted_at,
         submissionData.status
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
   }// New added

   async gradeAssignment(assignmentId, studentId, score) {
      // Cek apakah submission sudah ada
      const submission = await this.getStudentSubmission(assignmentId, studentId);

      if (submission) {
         // Update nilai pada submission yang sudah ada
         const updateQuery = `
         UPDATE assignment_submissions
         SET score = $1, status = 'graded', graded_at = NOW()
         WHERE assignment_id = $2 AND student_id = $3
         RETURNING *
      `;

         const result = await this.db.query(updateQuery, [score, assignmentId, studentId]);
         return result.rows[0];
      } else {
         // Buat submission baru dengan nilai
         const insertQuery = `
         INSERT INTO assignment_submissions
         (assignment_id, student_id, score, submission_date, status, graded_at)
         VALUES ($1, $2, $3, NOW(), 'graded', NOW())
         RETURNING *
      `;

         const result = await this.db.query(insertQuery, [assignmentId, studentId, score]);
         return result.rows[0];
      }
   }// New added

   _mapToModel(row) {
      const assignment = new Assignment(
         row.title,
         row.description,
         new Date(row.due_date),
         row.min_score,
         row.max_score,
         row.type,
         row.course_id
      );

      // Override the generated ID with the database ID
      assignment._id = row.id;
      assignment._status = row.status;
      assignment._createdAt = row.created_at;

      return assignment;
   }

   _generateAssignmentId() {
      const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(8, '4');
      return `ASG-${randomNumber}`;
   }
}

export default AssignmentRepository;