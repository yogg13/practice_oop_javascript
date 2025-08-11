class StudentController {
   constructor(studentRepository) {
      this._studentRepository = studentRepository;
   }

   async getAllStudents() {
      return await this._studentRepository.getAllStudents();
   }//✅

   async getStudentById(studentId) {
      return await this._studentRepository.getStudentById(studentId);
   }//✅

   async addStudent(studentData) {
      try {
         const student = await this._studentRepository.createStudent(studentData);
         return student;
      } catch (error) {
         console.error(`❌ Failed to add student: ${error.message}`);
         throw error;
      }
   }//✅

   async updateStudent(studentId, updatedData) {
      try {
         const student = await this._studentRepository.updateStudent(studentId, updatedData);
         if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
         }
         return student;
      } catch (error) {
         console.error(`❌ Failed to update student: ${error.message}`);
         throw error;
      }
   }//✅

   async generateStudentReport(studentId) {
      const student = await this._studentRepository.getStudentById(studentId);
      if (!student) {
         throw new Error(`Student with ID ${studentId} not found`);
      }

      // Get student courses
      const courses = await this._studentRepository.getStudentCourses(studentId);

      // Get student grades for each course
      const courseGrades = {};
      for (const course of courses) {
         courseGrades[course.id] = await this._studentRepository.getStudentGrades(studentId, course.id);
      }

      // Build academic summary
      const academicSummary = {
         studentInfo: student.getDisplayInfo(),
         enrolledCourses: courses.length,
         academicStatus: student.academicStatus,
         courses: courses.map(course => {
            const grades = courseGrades[course.id] || [];
            const gpa = this._calculateCourseGPA(grades);

            return {
               courseName: course.name,
               courseCode: course.code,
               courseGPA: gpa,
               status: course.status
            };
         })
      };

      return {
         student: student.getDisplayInfo(),
         academicSummary,
         generatedAt: new Date(),
      };
   }

   _calculateCourseGPA(grades) {
      if (grades.length === 0) return 0;

      let totalPercentage = 0;
      grades.forEach(grade => {
         totalPercentage += (grade.score / grade.max_score) * 100;
      });

      return totalPercentage / grades.length;
   }
}

export default StudentController;