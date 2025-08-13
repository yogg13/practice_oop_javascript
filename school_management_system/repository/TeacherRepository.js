import BaseRepository from './BaseRepository.js';
import Teacher from '../models/Teacher.js';

class TeacherRepository extends BaseRepository {
   constructor(db) {
      super(db, 'teachers');
      this.db = db;
   }

   async getAllTeachers() {
      // 1. Ambil semua data guru terlebih dahulu (hapus WHERE t.id = $1)
      const teacherQuery = `
      SELECT p.*, t.department, t.hire_date, t.employment_status, t.assigned_classes
      FROM teachers t
      JOIN persons p ON p.id = t.id
      ORDER BY p.name
   `;

      const teacherResult = await this.db.query(teacherQuery);

      // 2. Jika tidak ada guru, kembalikan array kosong
      if (teacherResult.rows.length === 0) return [];

      // 3. Dapatkan subjects untuk setiap guru dan map ke model Teacher
      const teachersWithSubjects = await Promise.all(teacherResult.rows.map(async (teacher) => {
         // Query untuk mendapatkan subjects guru
         const subjectsQuery = `
         SELECT subject FROM teacher_subjects
         WHERE teacher_id = $1
      `;

         const subjectsResult = await this.db.query(subjectsQuery, [teacher.id]);
         const subjects = subjectsResult.rows.map(row => row.subject);

         // Gabungkan data guru dengan subjects
         const teacherData = {
            ...teacher,
            subjects: subjects // Ubah dari subject -> subjects untuk konsistensi dengan _mapToModel
         };

         return this._mapToModel(teacherData);
      }));

      return teachersWithSubjects;
   }//✅

   async getTeacherById(id) {
      const teacherQuery = `
      SELECT p.*, t.department, t.hire_date, t.employment_status, t.assigned_classes
      FROM teachers t
      JOIN persons p ON p.id = t.id
      WHERE t.id = $1
   `;

      const teacherResult = await this.db.query(teacherQuery, [id]);
      if (teacherResult.rows.length === 0) return null;

      // Get subjects separately
      const subjectsQuery = `
      SELECT subject FROM teacher_subjects
      WHERE teacher_id = $1
   `;

      const subjectsResult = await this.db.query(subjectsQuery, [id]);
      const subject = subjectsResult.rows.map(row => row.subject);

      // Combine data
      const teacherData = {
         ...teacherResult.rows[0],
         subjects: subject
      };

      return this._mapToModel(teacherData);
   }//✅

   async createTeacher(teacherData) {
      return await this.db.executeTransaction(async (client) => {
         // First, insert the person record
         const personQuery = `
            INSERT INTO persons (id, name, email, phone, address, birth_date, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
         `;

         const teacherId = this._generateTeacherId();

         const personResult = await client.query(personQuery, [
            teacherId,
            teacherData.name,
            teacherData.email,
            teacherData.phone || null,
            teacherData.address || null,
            teacherData.birthDate || null,
            'Teacher'
         ]);

         // Then, insert the teacher record
         const teacherQuery = `
            INSERT INTO teachers (id, department, hire_date, employment_status, assigned_classes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
         `;

         const teacherResult = await client.query(teacherQuery, [
            teacherId,
            teacherData.department,
            teacherData.hireDate || new Date(),
            'active',
            teacherData.assignedClasses || null
         ]);

         // If there are subjects, insert them
         if (teacherData.subjects && teacherData.subjects.length > 0) {
            const subjectPromises = teacherData.subjects.map(subject => {
               const subjectQuery = `
                  INSERT INTO teacher_subjects (teacher_id, subject)
                  VALUES ($1, $2)
                  ON CONFLICT (teacher_id, subject) DO NOTHING
               `;
               return client.query(subjectQuery, [teacherId, subject]);
            });

            await Promise.all(subjectPromises);
         }

         // Get teacher subjects
         const subjectsQuery = `
            SELECT subject FROM teacher_subjects
            WHERE teacher_id = $1
         `;

         const subjectsResult = await client.query(subjectsQuery, [teacherId]);
         const subjects = subjectsResult.rows.map(row => row.subject);

         const teacher = {
            ...personResult.rows[0],
            ...teacherResult.rows[0],
            subjects
         };

         return this._mapToModel(teacher);
      });
   }//✅

   async updateTeacher(id, updatedData) {
      return await this.db.executeTransaction(async (client) => {
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

         // Update teacher data if necessary
         const teacherUpdates = {};

         if (updatedData.department && updatedData.department.trim() !== '') {
            teacherUpdates.department = updatedData.department;
            updated = true;
         }

         if (updatedData.employmentStatus && updatedData.employmentStatus.trim() !== '') {
            teacherUpdates.employment_status = updatedData.employmentStatus;
            updated = true;
         }

         if (updatedData.assignedClasses && updatedData.assignedClasses.trim() !== '') {
            teacherUpdates.assigned_classes = updatedData.assignedClasses;
            updated = true;
         }

         if (Object.keys(teacherUpdates).length > 0) {
            const setClause = Object.keys(teacherUpdates)
               .map((field, i) => `${field} = $${i + 1}`)
               .join(', ');

            const teacherQuery = `
               UPDATE teachers
               SET ${setClause}
               WHERE id = $${Object.keys(teacherUpdates).length + 1}
               RETURNING *
            `;

            await client.query(teacherQuery, [...Object.values(teacherUpdates), id]);
         }

         // Update subjects if provided
         if (updatedData.subjects && updatedData.subjects.length > 0) {
            // Get existing subjects
            const existingSubjectsQuery = `
               SELECT subject FROM teacher_subjects
               WHERE teacher_id = $1
            `;

            const existingResult = await client.query(existingSubjectsQuery, [id]);
            const existingSubjects = existingResult.rows.map(row => row.subject.toLowerCase());

            // Find new subjects to add
            const newSubjects = updatedData.subjects.filter(
               subject => !existingSubjects.includes(subject.toLowerCase())
            );

            // Add new subjects
            if (newSubjects.length > 0) {
               const subjectPromises = newSubjects.map(subject => {
                  const subjectQuery = `
                     INSERT INTO teacher_subjects (teacher_id, subject)
                     VALUES ($1, $2)
                     ON CONFLICT (teacher_id, subject) DO NOTHING
                  `;
                  return client.query(subjectQuery, [id, subject]);
               });

               await Promise.all(subjectPromises);
               updated = true;
            }
         }

         if (!updated) {
            return await this.getTeacherById(id);
         }

         // Get the updated teacher with subjects
         const query = `
            SELECT p.*, t.department, t.hire_date, t.employment_status, t.assigned_classes
            FROM teachers t
            JOIN persons p ON p.id = t.id
            WHERE t.id = $1
         `;

         const result = await client.query(query, [id]);

         // Get teacher subjects
         const subjectsQuery = `
            SELECT subject FROM teacher_subjects
            WHERE teacher_id = $1
         `;

         const subjectsResult = await client.query(subjectsQuery, [id]);
         const subjects = subjectsResult.rows.map(row => row.subject);

         const teacher = {
            ...result.rows[0],
            subjects
         };

         return this._mapToModel(teacher);
      });
   }//✅

   async getTeacherCourses(teacherId) {
      const query = `
         SELECT c.*
         FROM courses c
         WHERE c.teacher_id = $1
      `;

      const result = await this.db.query(query, [teacherId]);
      return result.rows;
   }//❌

   async getTeacherSubjects(teacherId) {
      const query = `
         SELECT subject FROM teacher_subjects
         WHERE teacher_id = $1
      `;

      const result = await this.db.query(query, [teacherId]);
      return result.rows.map(row => row.subject);
   }//❌

   _mapToModel(row) {
      const teacher = new Teacher(
         row.name,
         row.email,
         row.phone,
         row.address,
         row.birth_date,
         row.department,
         row.subjects || [],
         row.assigned_classes
      );

      // Override the generated ID with the database ID
      teacher._id = row.id;
      teacher._employmentStatus = row.employment_status;
      teacher._hireDate = row.hire_date;
      teacher._createdAt = row.created_at;
      teacher._updatedAt = row.updated_at;

      return teacher;
   }

   _generateTeacherId() {
      const year = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(8, '2');
      return `TCH-${year}${randomNumber}`;
   }
}

export default TeacherRepository;