import BaseRepository from "./BaseRepository.js";
import Student from "../models/Student.js";

class StudentRespository extends BaseRepository {
   constructor(db) {
      super(db, 'students');
      this._db = db;
   }

   async getAllStudents() {
      const query = `
         SELECT p.*, s.grade_level, s.academic_status, s.parent_name, s.parent_phone
         FROM students s
         JOIN persons p ON p.id = s.id
         ORDER BY p.name
      `;

      const result = await this._db.query(query);
      return result.rows.map(row => this._mapToModel(row));
   }//✅

   async getStudentById(id) {
      try {
         const studentQuery = `
         SELECT p.*, s.grade_level, s.academic_status, s.parent_name, s.parent_phone
         FROM students s
         JOIN persons p ON p.id = s.id
         WHERE s.id = $1
      `;

         const studentResult = await this._db.query(studentQuery, [id]);
         if (studentResult.rows.length === 0) return null;

         const student = this._mapToModel(studentResult.rows[0]);

         // Load enrolled courses
         const coursesQuery = `
         SELECT e.*, c.id as course_id, c.name as course_name, c.code as course_code, 
                c.subject, c.status as course_status, e.status as enrollment_status,
                e.enrolled_at
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = $1
      `;

         const coursesResult = await this._db.query(coursesQuery, [id]);

         // Map each enrollment to proper structure for student model
         student._enrolledCourses = new Map();

         coursesResult.rows.forEach(enrollment => {
            // Create a simplified course object
            const course = {
               id: enrollment.course_id,
               name: enrollment.course_name,
               code: enrollment.course_code,
               subject: enrollment.subject,
               status: enrollment.course_status
            };

            // Add to student's enrolledCourses map with course_id as key
            student._enrolledCourses.set(enrollment.course_id, {
               id: enrollment.id,
               course: course,
               status: enrollment.enrollment_status,
               enrolledAt: new Date(enrollment.enrolled_at)
            });
         });
         return student;
      } catch (error) {
         console.error(`Error fetching student with ID ${id}:`, error);
         throw error;
      }
   }//✅

   async createStudent(studentData) {
      return await this._db.executeTransaction(async (client) => {
         // First, insert the person record
         const personQuery = `
            INSERT INTO persons (id, name, email, phone, address, birth_date, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
         `;

         const studentId = this._generateStudentId();

         const personResult = await client.query(personQuery, [
            studentId,
            studentData.name,
            studentData.email,
            studentData.phone || null,
            studentData.address || null,
            studentData.birthDate || null,
            'High School'
         ]);

         // Then, insert the student record
         const studentQuery = `
            INSERT INTO students (id, grade_level, academic_status, parent_name, parent_phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
         `;

         const studentResult = await client.query(studentQuery, [
            studentId,
            studentData.gradeLevel,
            'active',
            studentData.parentContact?.name || null,
            studentData.parentContact?.phone || null
         ]);

         const student = {
            ...personResult.rows[0],
            ...studentResult.rows[0]
         };

         return this._mapToModel(student);
      });
   }//✅

   async updateStudent(id, updatedData) {
      return await this._db.executeTransaction(async (client) => {
         let updated = false;

         // Update person data if necessary
         const personFields = ['name', 'email', 'phone', 'address', 'birth_date'];
         const personUpdates = {};

         personFields.forEach(field => {
            const fieldName = field === 'birth_date' ? 'birthDate' : field;
            if (updatedData[fieldName] && updatedData[fieldName].trim() !== '') {
               personUpdates[field] = updatedData[fieldName];
               updated = true;
            }
         });

         if (Object.keys(personUpdates).length > 0) {
            const setClause = Object.keys(personUpdates)
               .map((field, i) => `${field} = $${i + 1}`)
               .join(', ');

            const personQuery = `
               UPDATE persons
               SET ${setClause}, updated_at = NOW()
               WHERE id = $${Object.keys(personUpdates).length + 1}
               RETURNING *
            `;

            await client.query(personQuery, [...Object.values(personUpdates), id]);
         }

         // Update student data if necessary
         const studentUpdates = {};

         if (updatedData.gradeLevel && updatedData.gradeLevel.trim() !== '') {
            studentUpdates.grade_level = updatedData.gradeLevel;
            updated = true;
         }

         if (updatedData.academicStatus && updatedData.academicStatus.trim() !== '') {
            studentUpdates.academic_status = updatedData.academicStatus;
            updated = true;
         }

         if (updatedData.parentContact) {
            if (updatedData.parentContact.name && updatedData.parentContact.name.trim() !== '') {
               studentUpdates.parent_name = updatedData.parentContact.name;
               updated = true;
            }

            if (updatedData.parentContact.phone && updatedData.parentContact.phone.trim() !== '') {
               studentUpdates.parent_phone = updatedData.parentContact.phone;
               updated = true;
            }
         }

         if (Object.keys(studentUpdates).length > 0) {
            const setClause = Object.keys(studentUpdates)
               .map((field, i) => `${field} = $${i + 1}`)
               .join(', ');

            const studentQuery = `
               UPDATE students
               SET ${setClause}
               WHERE id = $${Object.keys(studentUpdates).length + 1}
               RETURNING *
            `;

            await client.query(studentQuery, [...Object.values(studentUpdates), id]);
         }

         if (!updated) {
            return await this.getStudentById(id);
         }

         // Get the updated student
         const query = `
            SELECT p.*, s.grade_level, s.academic_status, s.parent_name, s.parent_phone
            FROM students s
            JOIN persons p ON p.id = s.id
            WHERE s.id = $1
         `;

         const result = await client.query(query, [id]);
         return this._mapToModel(result.rows[0]);
      });
   }//✅

   async getStudentCourses(studentId) {
      const query = `
         SELECT c.*, e.status, e.enrolled_at, e.dropped_at
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE e.student_id = $1
      `;

      const result = await this._db.query(query, [studentId]);
      return result.rows;
   }//❌

   async getStudentGrades(studentId, courseId = null) {
      let query = `
         SELECT * FROM grades
         WHERE student_id = $1
      `;

      const params = [studentId];

      if (courseId) {
         query += ` AND course_id = $2`;
         params.push(courseId);
      }

      query += ` ORDER BY date DESC`;

      const result = await this._db.query(query, params);
      return result.rows;
   }//❌

   _mapToModel(row) {
      const student = new Student(
         row.name,
         row.email,
         row.phone,
         row.address,
         new Date(row.birth_date),
         row.grade_level,
         {
            name: row.parent_name,
            phone: row.parent_phone
         }
      );

      // Override the generated ID with the database ID
      student._id = row.id;
      student._academicStatus = row.academic_status;
      student._createdAt = row.created_at;
      student._updatedAt = row.updated_at;

      // Initialize maps if they don't exist
      student._enrolledCourses = new Map();
      student._grades = new Map();
      student._attendance = new Map();
      student._achievements = [];

      return student;
   }

   _generateStudentId() {
      const year = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(8, '1')
      return `STD-${year}${randomNumber}`;
   }
}

export default StudentRespository;