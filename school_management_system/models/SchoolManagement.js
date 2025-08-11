import chalk from "chalk";
// import Course from "./Course.js";
// import Student from "./Student.js";
// import Teacher from "./Teacher.js";

class SchoolManagement {
   constructor(schoolName, systemConfig = {}) {
      this.schoolName = schoolName;
      this._students = new Map();
      this._teachers = new Map();
      this._courses = new Map();
      this._systemConfig = {
         maxStudentsPerCourse: 30,
         gradeScale: { A: 90, B: 80, C: 70, D: 60, F: 0 },
         attendanceThreshold: 75,
         academicYear: new Date().getFullYear(),
         ...systemConfig
      };
      this._createdAt = new Date();

      console.log(`🏫 ${schoolName} Management System initialized`);
      console.log(`📅 Academic Year: ${this._systemConfig.academicYear}`);
   }

   get schoolName() { return this._schoolName; }
   set schoolName(name) {
      if (typeof name !== 'string' || name.trim() === '') {
         return console.log(chalk.red('❌ Invalid School name'));
      }
      this._schoolName = name;
   }

   get academicYear() { return this._systemConfig.academicYear; }
   set academicYear(year) {
      if (typeof year !== 'number' || (year < 2000 || year > new Date().getFullYear())) {
         return console.log(chalk.red('❌ Invalid Academic Year'));
      }
      this._systemConfig.academicYear = year;
   }

   // Course management
   // createCourse(courseData) {
   //    try {
   //       const course = new Course(
   //          courseData.name,
   //          courseData.subject,
   //          courseData.code,
   //          courseData.description,
   //          courseData.schedule
   //       );

   //       this._courses.set(course.id, course);
   //       // this._addNotification(`Course created: ${course.name} (${course.code})`);
   //       console.log(`\n\n✅ Course created: ${course.name} (${course.code})`);
   //       return course;

   //    } catch (error) {
   //       console.error(`❌ Failed to create course: ${error.message}`);
   //       throw error;
   //    }
   // }

   // // Enrollment methods
   // enrollStudentInCourse(studentId, courseId) {
   //    const student = this._students.get(studentId);
   //    const course = this._courses.get(courseId);

   //    if (!student) throw new Error("Student not found");
   //    if (!course) throw new Error("Course not found");

   //    if (course.studentCount >= this._systemConfig.maxStudentsPerCourse) {
   //       throw new Error("Course is full");
   //    }

   //    course.enrollStudent(student);
   //    // this._addNotification(`${student.name} enrolled in ${course.name}`);
   //    console.log(`\n\n✅ ${student.name} enrolled in ${course.name}`);
   //    return true;
   // }

   // assignTeacherToCourse(teacherId, courseId) {
   //    const teacher = this._teachers.get(teacherId);
   //    const course = this._courses.get(courseId);

   //    if (!teacher) throw new Error("Teacher not found");
   //    if (!course) throw new Error("Course not found");

   //    course.assignTeacher(teacher);
   //    // this._addNotification(`${teacher.name} assigned to ${course.name}`);
   //    console.log(`\n\n✅ ${teacher.name} assigned to ${course.name}`);
   //    return true;
   // }

   // Getter methods
   // getCourse(courseId) { return this._courses.get(courseId); }
   // getAllCourses() { return Array.from(this._courses.values()); }

}

export default SchoolManagement;