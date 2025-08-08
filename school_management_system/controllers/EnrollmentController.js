class EnrollmentController {
   constructor() {
      this._enrollments = new Map();
   }

   // Enrollment methods
   enrollStudentInCourse(studentId, courseId) {
      const student = this._students.get(studentId);
      const course = this._courses.get(courseId);

      if (!student) throw new Error("Student not found");
      if (!course) throw new Error("Course not found");

      if (course.studentCount >= this._systemConfig.maxStudentsPerCourse) {
         throw new Error("Course is full");
      }

      course.enrollStudent(student);
      console.log(`\n\n✅ ${student.name} enrolled in ${course.name}`);
      return true;
   }

   assignTeacherToCourse(teacherId, courseId) {
      const teacher = this._teachers.get(teacherId);
      const course = this._courses.get(courseId);

      if (!teacher) throw new Error("Teacher not found");
      if (!course) throw new Error("Course not found");

      course.assignTeacher(teacher);
      console.log(`\n\n✅ ${teacher.name} assigned to ${course.name}`);
      return true;
   }

}

export default EnrollmentController;