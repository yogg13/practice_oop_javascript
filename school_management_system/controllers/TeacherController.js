class TeacherController {
   constructor(teacherRepository) {
      this._teacherRepository = teacherRepository;
   }

   async getAllTeachers() {
      return await this._teacherRepository.getAllTeachers();
   }//✅

   async getTeacherById(teacherId) {
      return await this._teacherRepository.getTeacherById(teacherId);
   }//✅

   async addTeacher(teacherData) {
      try {
         const teacher = await this._teacherRepository.createTeacher(teacherData);
         return teacher;
      } catch (error) {
         console.error(`❌ Failed to add teacher: ${error.message}`);
         throw error;
      }
   }//✅

   async updateTeacher(teacherId, updatedData) {
      try {
         const teacher = await this._teacherRepository.updateTeacher(teacherId, updatedData);
         if (!teacher) {
            throw new Error(`Teacher with ID ${teacherId} not found`);
         }
         return teacher;
      } catch (error) {
         console.error(`❌ Failed to update teacher: ${error.message}`);
         throw error;
      }
   }//✅

   async generateTeacherReport(teacherId) {
      const teacher = await this._teacherRepository.getTeacherById(teacherId);
      if (!teacher) {
         throw new Error(`Teacher with ID ${teacherId} not found`);
      }

      // Get courses taught by this teacher
      const courses = await this._teacherRepository.getTeacherCourses(teacherId);

      return {
         teacher: teacher.getDisplayInfo(),
         teachingSummary: {
            teachingLoad: courses.length,
            courses: courses.map(course => ({
               name: course.name,
               code: course.code,
               subject: course.subject,
               studentCount: course.student_count || 0,
               schedule: {
                  days: course.schedule_days ? course.schedule_days.split(',') : [],
                  time: course.schedule_time,
                  room: course.schedule_room
               }
            })),
            subjects: teacher.subjects
         },
         generatedAt: new Date()
      };
   }//❌
}

export default TeacherController;