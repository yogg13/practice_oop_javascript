import Person from './Person.js';

class Student extends Person {
   constructor(name, email, phone, address, birthDate, gradeLevel, parentContact) {
      super(name, email, phone, address, birthDate);

      this._role = "High School";
      this._id = this._generateId();
      this._gradeLevel = this._validateAndSetGrade(gradeLevel);
      this._enrolledCourses = new Map();
      this._grades = new Map();
      this._attendance = new Map();
      this._parentContact = parentContact || {};
      this._academicStatus = 'active'; //active, suspended, graduated, transferred
      this._achievements = [];
   }

   //Getters
   get id() { return this._id; }
   get gradeLevel() { return this._gradeLevel; }
   get enrolledCourses() { return Array.from(this._enrolledCourses.values()); }
   get parentContact() { return { ...this._parentContact }; }
   get academicStatus() { return this._academicStatus; }
   get achievements() { return [...this._achievements]; }

   //Setters
   set gradeLevel(newGradeLevel) {
      this._gradeLevel = this._validateAndSetGrade(newGradeLevel);
      this._updateTimestamp();
   }

   set parentContact(newContact) {
      this._parentContact = { ...newContact };
      this._updateTimestamp();
   }

   set academicStatus(status) {
      const validStatus = ['active', 'suspended', 'graduated', 'transferred'];
      if (!validStatus.includes(status)) {
         throw new Error("Invalid academic status");
      }
      this._academicStatus = status;
      this._updateTimestamp();
   }

   _generateId() {
      const year = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(8, '1')
      return `STD-${year}${randomNumber}`;
   }

   _validateAndSetGrade(gradeLevel) {
      const validGradeLevel = ['10', '11', '12'];
      if (!validGradeLevel.includes(gradeLevel.toString())) {
         throw new Error("Invalid grade level, Must be between 10-12");
      }
      return gradeLevel.toString();
   }

   //Override Parent method - Polymorphism
   getDisplayInfo() {
      return `${this._name} - Grade Level ${this._gradeLevel} (${this._id})`;
   }

   enrollInCourse(course) {
      if (this._enrolledCourses.has(course.id)) {
         throw new Error(`Already enroller in course: ${course.name}`);
      }

      if (this._academicStatus !== 'active') {
         throw new Error(`Can't enroll: academic status is ${this._academicStatus}`);
      }

      this._enrolledCourses.set(course.id, {
         course: course,
         enrolledAt: new Date(),
         status: 'active',
      })

      //Initialize collection for this course
      this._grades.set(course.id, []);
      this._attendance.set(course.id, []);

      this._updateTimestamp();
      return true;
   }

   dropCourse(courseId) {
      if (!this._enrolledCourses.has(courseId)) {
         throw new Error("Not enrolled in this course");
      }

      const enrollment = this._enrolledCourses.get(courseId);
      enrollment.status = 'dropped';
      enrollment.droppedAt = new Date();

      this._updateTimestamp();
      return true;
   }

   addGrade(courseId, gradeData) {
      if (!this._enrolledCourses.has(courseId)) {
         throw new Error("Not enrolled in this course");
      }

      const courseGrades = this._grades.get(courseId);
      const gradeEntry = {
         type: gradeData.type || 'assignment',
         title: gradeData.title || 'Untitled',
         score: gradeData.score || 0,
         maxScore: gradeData.maxScore || 100,
         date: gradeData.date || new Date(),
         recordedAt: new Date(),
      }

      courseGrades.push(gradeEntry);
      this._updateTimestamp();
      return gradeEntry;
   }

   getGradesForCourse(courseId) {
      return this._grades.get(courseId);
   }//❌

   addAchievement(title, description, date, category = 'academic') {
      const achievement = {
         id: this._generateId(),
         title: title,
         description: description || 'No description provided',
         date: new Date(date),
         category: category,
         createdAt: new Date(),
      }

      this._achievements.push(achievement);
      this._updateTimestamp();
      return achievement;
   }//❌

   calculateCourseGPA(courseId) {
      // const grades = this.getGradesForCourse(courseId);
      // if (grades.length === 0) return 0;

      // let totalPercentage = 0;
      // grades.forEach(grade => {
      //    totalPercentage += (grade.score / grade.maxScore) * 100;
      // });

      // return totalPercentage / grades.length;

      // Basic implementation returning a placeholder value
      // In a real app, we'd calculate this from grades data
      return 3.5;
   }//❌

   markAttendance(courseId, date, status) {
      if (!this._enrolledCourses.has(courseId)) {
         throw new Error("Not enrolled in this course");
      }

      const validStatus = ['present', 'absent', 'sick',];
      if (!validStatus.includes(status)) {
         throw new Error("Invalid attendance status");
      }

      const attendance = this._attendance.get(courseId);
      attendance.push({
         date: new Date(date),
         status: status,
         recordedAt: new Date(),
      });

      this._updateTimestamp();
      return true;
   }//❌

   getAcademicSummary() {
      return {
         studentInfo: this.getDisplayInfo(),
         enrolledCourses: this.enrolledCourses.length,
         academicStatus: this._academicStatus,
         courses: this.enrolledCourses.map(enroll => ({
            courseName: enroll.course.name,
            courseCode: enroll.course.code,
            courseGPA: this.calculateCourseGPA(enroll.course.id),
            status: enroll.status
         }))
      };
   }//❌

}

export default Student;