import Assignment from "./Assignment.js";
import Exam from "./Exam.js";
import Student from "./Student.js";
import Teacher from "./Teacher.js";

class Course {
   constructor(name, subject, code, description, schedule) {
      this._id = this._generateCourseId();
      this._name = name;
      this._subject = subject;
      this._code = code;
      this._description = description;
      this._schedule = schedule;
      this._teacherId = null;
      this._teacherName = null;
      this._enrolledStudents = new Map();
      this._assignments = new Map();
      this._exams = new Map();
      this._status = 'active'; // active, completed, cancelled
      this._createdAt = new Date();
      this._updatedAt = new Date();
   }

   //Getters
   get id() { return this._id; }
   get name() { return this._name; }
   get subject() { return this._subject; }
   get code() { return this._code; }
   get description() { return this._description; }
   get schedule() { return { ...this._schedule }; }
   get teacherId() { return this._teacherId; };
   get teacherName() { return this._teacherName; }
   get enrolledStudents() { return Array.from(this._enrolledStudents.values()); }
   get assignments() { return Array.from(this._assignments.values()); }
   get exams() { return Array.from(this._exams.values()); }
   get status() { return this._status; }
   get studentCount() { return this._enrolledStudents.size; }
   get teacherInfo() {
      return this._teacherName ? `${this._teacherName} (${this._teacherId})` : 'Not Assigned';
   }

   // Setters
   set name(newName) {
      if (newName.trim() === '') {
         throw new Error("Invalid course name");
      }
      this._name = newName;
      this._updateTimestamp();
   }
   set code(newCode) {
      if (newCode.trim() === '') {
         throw new Error("Invalid course code");
      }
      this._code = newCode;
      this._updateTimestamp();
   }
   set subject(newSubject) {
      if (typeof newSubject !== 'string' || newSubject.trim() === '') {
         throw new Error("Invalid subject");
      }
      this._subject = newSubject;
      this._updateTimestamp();
   }
   set description(newDescription) {
      if (newDescription.trim() === '') {
         throw new Error("Invalid description");
      }

      this._description = newDescription;
      this._updateTimestamp();
   }
   set schedule(newSchedule) {
      this._schedule = { ...newSchedule };
      this._updateTimestamp();
   }
   set status(newStatus) {
      const validStatus = ['active', 'completed', 'cancelled'];
      if (!validStatus.includes(newStatus)) {
         throw new Error("Invalid course status");
      }
      this._status = newStatus;
      this._updateTimestamp();
   }
   // set studentCount(count) {
   //    if (typeof count !== 'number' || count < 0) {
   //       throw new Error("Invalid student count");
   //    }
   //    this._studentCount = count;
   //    this._updateTimestamp();
   // }

   _generateCourseId() {
      return `CRS-${Math.random().toString(36).substring(2, 9)}`;
   }

   _updateTimestamp() {
      this._updatedAt = new Date();
   }

   //method for course management
   assignTeacher(teacher) {
      if (!(teacher instanceof Teacher)) {
         throw new Error("Invalid object Teacher");
      }
      if (teacher.employmentStatus !== 'active') {
         throw new Error("Teacher is not active");
      }

      this._teacher = teacher;
      teacher.assignToCourse(this);
      this._updateTimestamp();
      return true;
   }

   enrollStudent(student) {
      if (!(student instanceof Student)) {
         throw new Error("Invalid object Student");
      }
      if (this._enrolledStudents.has(student.id)) {
         throw new Error("Student already enroller in this course");
      }
      if (student.academicStatus !== 'active') {
         throw new Error("Student is not active");
      }

      this._enrolledStudents.set(student.id, {
         student: student,
         enrolledAt: new Date(),
         status: 'active',
      })

      student.enrollInCourse(this);
      this._updateTimestamp();
      return true;
   }

   removeStudent(studentId) {
      if (!this._enrolledStudents.has(studentId)) {
         throw new Error("Student not enrolled in this course");
      }

      const enrollment = this._enrolledStudents.get(studentId);
      enrollment.status = 'dropped';
      enrollment.droppedAt = new Date();

      this._updateTimestamp();
      return true;
   }

   createAssignment(title, description, dueDate, minScore, maxScore, type = 'assignment') {
      const assignment = new Assignment(title, description, dueDate, minScore, maxScore, type, this._id);
      this._assignments.set(assignment.id, assignment);
      this._updateTimestamp();
      return assignment;
   }

   createExam(title, date, duration, minScore, maxScore, examType = 'exam') {
      const exam = new Exam(title, date, duration, minScore, maxScore, examType, this._id);
      this._exams.set(exam.id, exam);
      this._updateTimestamp();
      return exam;
   }

   getStudentGrades(studentId) {
      if (!this._enrolledStudents.has(studentId)) {
         throw new Error("Student not enroll in this course");
      }

      const student = this._enrolledStudents.get(studentId).student;
      return student.getGradesForCourse(this._id);
   }

   getCourseInfo() {
      return {
         id: this._id,
         name: this._name,
         subject: this._subject,
         code: this._code,
         description: this._description,
         schedule: this._schedule,
         teacher: this._teacher ? this._teacher.getDisplayInfo() : 'Not Assigned',
         studentCount: this._enrolledStudents.size,
         assignmentCount: this._assignments.size,
         examCount: this._exams.size,
         status: this._status,
         createdAt: this._createdAt,
         updatedAt: this._updatedAt
      };
   }
}

export default Course;