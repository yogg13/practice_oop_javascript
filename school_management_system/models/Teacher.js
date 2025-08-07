import Person from "./Person.js";

class Teacher extends Person {
   constructor(name, email, phone, address, birthDate, department, subjects, assignedClasses, qualifications = []) {
      super(name, email, phone, address, birthDate);

      this._role = 'Teacher';
      this._id = this._generateId();
      this._department = department;
      this._subjects = Array.isArray(subjects) ? subjects : [subjects];
      this._qualifications = qualifications;
      this._assignedCourses = new Map();
      this._assignedClasses = assignedClasses || 'N/A';
      this._hireDate = new Date();
      this._employmentStatus = 'active'; // active, on_leave, terminated
   }

   // Getters
   get id() { return this._id; }
   get department() { return this._department; }
   get subjects() { return [...this._subjects]; }
   get qualifications() { return [...this._qualifications]; }
   get assignedClasses() { return this._assignedClasses; }
   get assignedCourses() { return Array.from(this._assignedCourses.values()); }
   get hireDate() { return new Date(this._hireDate); }
   get employmentStatus() { return this._employmentStatus; }

   // Setters
   set department(newDepartment) {
      this._department = newDepartment;
      this._updateTimestamp();
   }

   set employmentStatus(status) {
      const validStatuses = ['active', 'on_leave', 'terminated'];
      if (!validStatuses.includes(status)) {
         throw new Error("Invalid employment status");
      }
      this._employmentStatus = status;
      this._updateTimestamp();
   }

   set assignedClasses(classes) {
      this._assignedClasses = classes || 'N/A';
      this._updateTimestamp();
   }

   _generateId() {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(10, '0');
      return `TCH-${year}${random}`;
   }

   // Override parent method
   getDisplayInfo() {
      return `${this._name} - ${this._department} Teacher (${this._id})`;
   }

   // Teacher-specific methods
   addSubject(subject) {
      if (!this._subjects.includes(subject)) {
         this._subjects.push(subject);
         this._updateTimestamp();
         return true;
      }
      return false;
   }

   removeSubject(subject) {
      const index = this._subjects.indexOf(subject);
      if (index > -1) {
         this._subjects.splice(index, 1);
         this._updateTimestamp();
         return true;
      }
      return false;
   }

   canTeachSubject(subject) {
      return this._subjects.includes(subject);
   }

   assignToCourse(course) {
      if (this._assignedCourses.has(course.id)) {
         throw new Error(`Already assigned to course: ${course.name}`);
      }

      if (!this.canTeachSubject(course.subject)) {
         throw new Error(`Cannot teach ${course.subject}. Not qualified for this subject.`);
      }

      if (this._employmentStatus !== 'active') {
         throw new Error(`Cannot assign course: employment status is ${this._employmentStatus}`);
      }

      this._assignedCourses.set(course.id, {
         course: course,
         assignedAt: new Date(),
         status: 'active'
      });

      this._updateTimestamp();
      return true;
   }

   unassignFromCourse(courseId) {
      if (!this._assignedCourses.has(courseId)) {
         throw new Error("Not assigned to this course");
      }

      const assignment = this._assignedCourses.get(courseId);
      assignment.status = 'unassigned';
      assignment.unassignedAt = new Date();

      this._updateTimestamp();
      return true;
   }

   addQualification(qualification) {
      const qualificationEntry = {
         id: this._generateId(),
         ...qualification,
         addedAt: new Date()
      };

      this._qualifications.push(qualificationEntry);
      this._updateTimestamp();
      return qualificationEntry;
   }

   updateQualification(qualificationId, updatedData) {
      const index = this._qualifications.findIndex(q => q.id === qualificationId);
      if (index === -1) {
         throw new Error("Qualification not found");
      }
      this._qualifications[index] = {
         ...this._qualifications[index],
         ...updatedData,
      };

      this._updateTimestamp();
      return this._qualifications[index];
   }

   getTeachingLoad() {
      return Array.from(this._assignedCourses.values())
         .filter(assignment => assignment.status === 'active').length;
   }

   getTeachingSummary() {
      const activeCourses = this.assignedCourses.filter(assignment => assignment.status === 'active');

      return {
         teacherInfo: this.getDisplayInfo(),
         department: this._department,
         subjects: this._subjects,
         teachingLoad: activeCourses.length || 0,
         courses: activeCourses.map(assignment => ({
            courseName: assignment.course.name || 'N/A',
            courseCode: assignment.course.code || 'N/A',
            studentCount: assignment.course.studentCount || 0,
            assignedAt: assignment.assignedAt || 'N/A'
         })),
         qualifications: this._qualifications || 'N/A',
         employmentStatus: this._employmentStatus
      }
   }
}
export default Teacher;

//perbedaan subjects dengan assignedCourses adalah:
// subjects berisi daftar kategori dari mata pelajaran yang diajarkan oleh guru,
// sedangkan assignedCourses adalah mata pelajaran yang telah ditugaskan kepada guru untuk diajarkan pada semester tertentu.