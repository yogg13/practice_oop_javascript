import BaseRepository from './BaseRepository.js';
import Course from '../models/Course.js';

class CourseRepository extends BaseRepository {
   constructor(db) {
      super(db, 'courses');
      this.db = db;
   }

   async getAllCourses() {
      const query = `
         SELECT c.*, 
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') as student_count,
                t.id as teacher_id, p.name as teacher_name
         FROM courses c
         LEFT JOIN teachers t ON c.teacher_id = t.id
         LEFT JOIN persons p ON t.id = p.id
         ORDER BY c.name
      `;

      const result = await this.db.query(query);
      return Promise.all(result.rows.map(async row => this._mapToModel(row)));
   }

   async getCourseById(id) {
      const query = `
         SELECT c.*, 
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') as student_count,
                t.id as teacher_id, p.name as teacher_name
         FROM courses c
         LEFT JOIN teachers t ON c.teacher_id = t.id
         LEFT JOIN persons p ON t.id = p.id
         WHERE c.id = $1
      `;

      const result = await this.db.query(query, [id]);
      if (result.rows.length === 0) return null;

      return this._mapToModel(result.rows[0]);
   }

   async createCourse(courseData) {
      const courseId = this._generateCourseId();

      const query = `
         INSERT INTO courses (
            id, name, subject, code, description, 
            schedule_days, schedule_time, schedule_room,
            status, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *
      `;

      const result = await this.db.query(query, [
         courseId,
         courseData.name,
         courseData.subject,
         courseData.code,
         courseData.description,
         courseData.schedule.days.join(','),
         courseData.schedule.time,
         courseData.schedule.room,
         'active'
      ]);

      return this._mapToModel(result.rows[0]);
   }

   async updateCourse(id, updatedData) {
      return await this.db.executeTransaction(async (client) => {
         // Get current course data
         const currentCourseQuery = `
            SELECT * FROM courses WHERE id = $1
         `;

         const currentResult = await client.query(currentCourseQuery, [id]);
         if (currentResult.rows.length === 0) {
            throw new Error(`Course with ID ${id} not found`);
         }

         const currentCourse = currentResult.rows[0];

         // Prepare update data
         const updates = {};

         if (updatedData.name && updatedData.name.trim() !== '') {
            updates.name = updatedData.name;
         }

         if (updatedData.code && updatedData.code.trim() !== '') {
            updates.code = updatedData.code;
         }

         if (updatedData.subject && updatedData.subject.trim() !== '') {
            updates.subject = updatedData.subject;
         }

         if (updatedData.description && updatedData.description.trim() !== '') {
            updates.description = updatedData.description;
         }

         if (updatedData.status && updatedData.status.trim() !== '') {
            updates.status = updatedData.status;
         }

         if (updatedData.schedule) {
            if (updatedData.schedule.days && updatedData.schedule.days.length > 0) {
               updates.schedule_days = updatedData.schedule.days.join(',');
            }

            if (updatedData.schedule.time && updatedData.schedule.time.trim() !== '') {
               updates.schedule_time = updatedData.schedule.time;
            }

            if (updatedData.schedule.room && updatedData.schedule.room.trim() !== '') {
               updates.schedule_room = updatedData.schedule.room;
            }
         }

         // If no updates, return current course
         if (Object.keys(updates).length === 0) {
            return this.getCourseById(id);
         }

         // Build update query
         const fields = Object.keys(updates);
         const values = Object.values(updates);

         const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

         const updateQuery = `
            UPDATE courses
            SET ${setClause}, updated_at = NOW()
            WHERE id = $${fields.length + 1}
            RETURNING *
         `;

         const result = await client.query(updateQuery, [...values, id]);
         return this._mapToModel(result.rows[0]);
      });
   }

   async assignTeacher(courseId, teacherId) {
      const query = `
         UPDATE courses
         SET teacher_id = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *
      `;

      const result = await this.db.query(query, [teacherId, courseId]);
      return result.rows[0];
   }

   async getEnrolledStudents(courseId) {
      const query = `
         SELECT e.*, s.id as student_id, p.name as student_name,
                p.email, s.grade_level, s.academic_status
         FROM enrollments e
         JOIN students s ON e.student_id = s.id
         JOIN persons p ON s.id = p.id
         WHERE e.course_id = $1
      `;

      const result = await this.db.query(query, [courseId]);
      return result.rows;
   }

   async getAssignments(courseId) {
      const query = `
         SELECT * FROM assignments
         WHERE course_id = $1
         ORDER BY due_date
      `;

      const result = await this.db.query(query, [courseId]);
      return result.rows;
   }

   async getExams(courseId) {
      const query = `
         SELECT * FROM exams
         WHERE course_id = $1
         ORDER BY exam_date
      `;

      const result = await this.db.query(query, [courseId]);
      return result.rows;
   }

   async _mapToModel(row) {
      const course = new Course(
         row.name,
         row.subject,
         row.code,
         row.description,
         {
            days: row.schedule_days ? row.schedule_days.split(',') : [],
            time: row.schedule_time,
            room: row.schedule_room
         }
      );

      // Override the generated ID with the database ID
      course._id = row.id;
      course._status = row.status;
      course._createdAt = row.created_at;
      course._updatedAt = row.updated_at;

      // Add enrolled students (placeholder, will be populated when needed)
      // course.studentCount = row.student_count || 0;

      // Add teacher if exists
      // This is a placeholder, the actual teacher object would be set separately
      if (row.teacher_id) {
         course._teacherId = row.teacher_id;
         course._teacherName = row.teacher_name;
      }

      // Load enrolled students, assignments, and exams
      try {
         // Load assignments
         const assignments = await this.getAssignments(row.id);
         course._assignments = assignments || [];

         // Load exams
         const exams = await this.getExams(row.id);
         course._exams = exams || [];
      } catch (error) {
         console.error(`Error loading course details: ${error.message}`);
         course._assignments = [];
         course._exams = [];
      }
      return course;
   }

   _generateCourseId() {
      const year = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(8, '3');
      return `CRS-${year}${randomNumber}`;
   }
}

export default CourseRepository;