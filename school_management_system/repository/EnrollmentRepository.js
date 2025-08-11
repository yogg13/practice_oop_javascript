import BaseRepository from './BaseRepository.js';

class EnrollmentRepository extends BaseRepository {
   constructor(db) {
      super(db, 'enrollments');
      this.db = db;
   }

   async getEnrollmentById(id) {
      const query = `
         SELECT e.*, 
                s.id as student_id, p_s.name as student_name, p_s.email as student_email,
                c.id as course_id, c.name as course_name, c.code as course_code
         FROM enrollments e
         JOIN students s ON e.student_id = s.id
         JOIN persons p_s ON s.id = p_s.id
         JOIN courses c ON e.course_id = c.id
         WHERE e.id = $1
      `;

      const result = await this.db.query(query, [id]);
      return result.rows[0];
   }

   async getStudentEnrollments(studentId) {
      const query = `
         SELECT e.*, c.name as course_name, c.code as course_code, c.subject, 
                c.schedule_days, c.schedule_time, c.schedule_room
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = $1
         ORDER BY e.enrolled_at DESC
      `;

      const result = await this.db.query(query, [studentId]);
      return result.rows;
   }

   async getCourseEnrollments(courseId) {
      const query = `
         SELECT e.*, p.name as student_name, p.email as student_email,
                s.grade_level, s.academic_status
         FROM enrollments e
         JOIN students s ON e.student_id = s.id
         JOIN persons p ON s.id = p.id
         WHERE e.course_id = $1
         ORDER BY e.enrolled_at DESC
      `;

      const result = await this.db.query(query, [courseId]);
      return result.rows;
   }

   async enrollStudent(studentId, courseId) {
      // Check if student already enrolled
      const checkQuery = `
         SELECT * FROM enrollments
         WHERE student_id = $1 AND course_id = $2
      `;

      const checkResult = await this.db.query(checkQuery, [studentId, courseId]);

      if (checkResult.rows.length > 0) {
         // If already enrolled but status is 'dropped', reactivate
         if (checkResult.rows[0].status === 'dropped') {
            const updateQuery = `
               UPDATE enrollments
               SET status = 'active', dropped_at = NULL
               WHERE student_id = $1 AND course_id = $2
               RETURNING *
            `;

            const result = await this.db.query(updateQuery, [studentId, courseId]);
            return result.rows[0];
         } else {
            throw new Error(`Student is already enrolled in this course`);
         }
      }

      // Create new enrollment
      const insertQuery = `
         INSERT INTO enrollments (student_id, course_id, status, enrolled_at)
         VALUES ($1, $2, 'active', NOW())
         RETURNING *
      `;

      const result = await this.db.query(insertQuery, [studentId, courseId]);
      return result.rows[0];
   }

   async dropStudent(studentId, courseId) {
      const query = `
         UPDATE enrollments
         SET status = 'dropped', dropped_at = NOW()
         WHERE student_id = $1 AND course_id = $2 AND status = 'active'
         RETURNING *
      `;

      const result = await this.db.query(query, [studentId, courseId]);

      if (result.rows.length === 0) {
         throw new Error(`No active enrollment found for this student in this course`);
      }

      return result.rows[0];
   }

   async getStudentGrades(studentId, courseId) {
      const query = `
         SELECT * FROM grades
         WHERE student_id = $1 AND course_id = $2
         ORDER BY date DESC
      `;

      const result = await this.db.query(query, [studentId, courseId]);
      return result.rows;
   }

   async recordGrade(gradeData) {
      const query = `
         INSERT INTO grades (
            student_id, course_id, type, title, 
            score, max_score, date, recorded_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *
      `;

      const result = await this.db.query(query, [
         gradeData.studentId,
         gradeData.courseId,
         gradeData.type,
         gradeData.title,
         gradeData.score,
         gradeData.maxScore,
         gradeData.date || new Date()
      ]);

      return result.rows[0];
   }
}

export default EnrollmentRepository;