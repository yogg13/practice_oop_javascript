import Course from "./Course.js";
import Student from "./Student.js";
import Teacher from "./Teacher.js";

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
      // this._notifications = [];

      console.log(`🏫 ${schoolName} Management System initialized`);
      console.log(`📅 Academic Year: ${this._systemConfig.academicYear}`);
   }

   // Helper method untuk notifications
   // _addNotification(message) {
   //    this._notifications.push({
   //       id: Date.now().toString(36) + Math.random().toString(36).substring(2),
   //       message: message,
   //       timestamp: new Date(),
   //       read: false
   //    });
   // }

   // Student management
   // addStudent(studentData) {
   //    try {
   //       let student = new Student(
   //          studentData.name,
   //          studentData.email,
   //          studentData.phone,
   //          studentData.address,
   //          studentData.birthDate,
   //          studentData.grade,
   //          studentData.parentContact
   //       );

   //       this._students.set(student.id, student);
   //       // this._addNotification(`Student added: ${student.getDisplayInfo()}`);
   //       console.log(`\n\n✅ Student added: ${student.getDisplayInfo()}`);
   //       return student;

   //    } catch (error) {
   //       console.error(`❌ Failed to add student: ${error.message}`);
   //       throw error;
   //    }
   // }

   // Teacher management
   addTeacher(teacherData) {
      try {
         let teacher = new Teacher(
            teacherData.name,
            teacherData.email,
            teacherData.phone,
            teacherData.address,
            teacherData.birthDate,
            teacherData.department,
            teacherData.subjects,
            teacherData.assignedClasses,
            teacherData.qualifications
         );

         this._teachers.set(teacher.id, teacher);
         // this._addNotification(`Teacher added: ${teacher.getDisplayInfo()}`);
         console.log(`\n\n✅ Teacher added: ${teacher.getDisplayInfo()}`);
         return teacher;

      } catch (error) {
         console.error(`❌ Failed to add teacher: ${error.message}`);
         throw error;
      }
   }

   // Course management
   createCourse(courseData) {
      try {
         const course = new Course(
            courseData.name,
            courseData.subject,
            courseData.code,
            courseData.description,
            courseData.schedule
         );

         this._courses.set(course.id, course);
         // this._addNotification(`Course created: ${course.name} (${course.code})`);
         console.log(`\n\n✅ Course created: ${course.name} (${course.code})`);
         return course;

      } catch (error) {
         console.error(`❌ Failed to create course: ${error.message}`);
         throw error;
      }
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
      // this._addNotification(`${student.name} enrolled in ${course.name}`);
      console.log(`\n\n✅ ${student.name} enrolled in ${course.name}`);
      return true;
   }

   assignTeacherToCourse(teacherId, courseId) {
      const teacher = this._teachers.get(teacherId);
      const course = this._courses.get(courseId);

      if (!teacher) throw new Error("Teacher not found");
      if (!course) throw new Error("Course not found");

      course.assignTeacher(teacher);
      // this._addNotification(`${teacher.name} assigned to ${course.name}`);
      console.log(`\n\n✅ ${teacher.name} assigned to ${course.name}`);
      return true;
   }

   // Getter methods
   // getStudent(studentId) { return this._students.get(studentId); }
   getTeacher(teacherId) { return this._teachers.get(teacherId); }
   getCourse(courseId) { return this._courses.get(courseId); }
   // getAllStudents() { return Array.from(this._students.values()); }
   getAllTeachers() { return Array.from(this._teachers.values()); }
   getAllCourses() { return Array.from(this._courses.values()); }
   // getNotifications() { return [...this._notifications]; }

   // Reporting methods
   generateStudentReport(studentId) {
      const student = this._students.get(studentId);
      if (!student) throw new Error("Student not found");

      return {
         student: student.getFullProfile(),
         academicSummary: student.getAcademicSummary(),
         generatedAt: new Date(),
         academicYear: this._systemConfig.academicYear
      };
   }

   generateTeacherReport(teacherId) {
      const teacher = this._teachers.get(teacherId);
      if (!teacher) throw new Error("Teacher not found");

      return {
         teacher: teacher.getFullProfile(),
         teachingSummary: teacher.getTeachingSummary(),
         generatedAt: new Date(),
         academicYear: this._systemConfig.academicYear
      };
   }

   generateCourseReport(courseId) {
      const course = this._courses.get(courseId);
      if (!course) throw new Error("Course not found");

      return {
         course: course.getCourseInfo(),
         students: course.enrolledStudents.map(enrollment => ({
            student: enrollment.student.getDisplayInfo(),
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
            gpa: enrollment.student.calculateCourseGPA(courseId),
         })),
         generatedAt: new Date(),
         academicYear: this._systemConfig.academicYear
      };
   }
}

export default SchoolManagement;