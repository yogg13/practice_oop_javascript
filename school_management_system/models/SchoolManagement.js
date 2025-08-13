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

}

export default SchoolManagement;