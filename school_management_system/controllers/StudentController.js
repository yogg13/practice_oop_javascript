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

   _calculateCourseGPA(grades) {
      if (grades.length === 0) return 0;

      let totalPercentage = 0;
      grades.forEach(grade => {
         totalPercentage += (grade.score / grade.max_score) * 100;
      });

      return totalPercentage / grades.length;
   }//❌
}

export default StudentController;