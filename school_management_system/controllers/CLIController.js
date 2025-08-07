import readlineSync from 'readline-sync';
import chalk from 'chalk';
import clear from 'clear';
import SchoolManagement from '../models/SchoolManagement.js';
import CLIView from '../views/CLIView.js';
import StudentController from './StudentController.js';

class CLIController {
   constructor() {
      this.schoolSystem = null;
      this.view = new CLIView();
      this.studentController = new StudentController();
   }

   async initialize() {
      clear();
      this.view.showHeader();

      // Setup school management system
      const schoolName = readlineSync.question(chalk.blue('Enter school name: '));
      const academicYear = readlineSync.question(chalk.blue('Enter academic year (default: current year): ')) || new Date().getFullYear();

      this.schoolSystem = new SchoolManagement(schoolName, {
         academicYear: parseInt(academicYear)
      });

      await this.mainMenu();
   }

   async mainMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showMainMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.studentMenu();
               break;
            case '2':
               await this.teacherMenu();
               break;
            case '3':
               await this.courseMenu();
               break;
            case '4':
               await this.reportMenu();
               break;
            case '5':
               await this.enrollmentMenu();
               break;
            case '0':
               console.log(chalk.green('Thank you for using the School Management System!'));
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async studentMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showStudentMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.createStudent();
               break;
            case '2':
               await this.viewAllStudents();
               break;
            case '3':
               await this.viewStudentDetails();
               break;
            case '4':
               await this.updateStudentInfo();
               break;
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async createStudent() {
      clear();
      this.view.showHeader();

      try {
         const studentData = {
            name: readlineSync.question(chalk.blue('Enter student name: ')),
            email: readlineSync.question(chalk.blue('Enter student email: ')),
            phone: readlineSync.question(chalk.blue('Enter student phone: ')),
            address: readlineSync.question(chalk.blue('Enter student address: ')),
            birthDate: readlineSync.question(chalk.blue('Enter birth date (YYYY-MM-DD): ')),
            gradeLevel: readlineSync.question(chalk.blue('Enter grade level (10, 11, 12): ')),
            parentContact: {
               name: readlineSync.question(chalk.blue('Enter parent name: ')),
               phone: readlineSync.question(chalk.blue('Enter parent phone: ')),
            }
         };
         this.studentController.addStudent(studentData);
      } catch (error) {
         console.log(chalk.red(`\nError adding student: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async viewAllStudents() {
      clear();
      this.view.showHeader();

      const students = this.studentController.getAllStudents();
      if (students.length === 0) {
         console.log(chalk.yellow('No students found in the system.'));
      } else {
         this.view.displayStudentList(students);
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async viewStudentDetails() {
      clear();
      this.view.showHeader();

      const studentId = readlineSync.question(chalk.blue('Enter student ID: '));
      const student = this.studentController.getStudentById(studentId);

      if (student) {
         this.view.displayStudentDetails(student, this.schoolSystem);
      } else {
         console.log(chalk.red('Student not found!'));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async updateStudentInfo() {
      clear();
      this.view.showHeader();

      const studentId = readlineSync.question(chalk.blue('Enter student ID to update: '));
      let student = this.studentController.getStudentById(studentId);

      if (!student) {
         console.log(chalk.red('Student not found!'));
         readlineSync.question('\nPress Enter to continue...');
         return;
      }

      console.log(chalk.yellow('\nCurrent Student Information:'));
      this.view.displayStudentDetails(student);
      console.log(chalk.yellow('\nLeave field empty to keep current value.'));

      try {
         const updatedData = {
            name: readlineSync.question(chalk.blue(`Enter new name [${student.name}]: `)) || '',
            email: readlineSync.question(chalk.blue(`Enter new email [${student.email}]: `)) || '',
            phone: readlineSync.question(chalk.blue(`Enter new phone [${student.phone}]: `)) || '',
            address: readlineSync.question(chalk.blue(`Enter new address [${student.address}]: `)) || '',
            birthDate: readlineSync.question(chalk.blue(`Enter new birth date (YYYY-MM-DD) [${student.birthDate}]: `)) || '',
            gradeLevel: readlineSync.question(chalk.blue(`Enter new grade level [${student.gradeLevel}]: `)) || '',
            parentContact: {
               name: readlineSync.question(chalk.blue(`Enter new parent name [${student.parentContact.name}]: `)) || '',
               phone: readlineSync.question(chalk.blue(`Enter new parent phone [${student.parentContact.phone}]: `)) || '',
            }
         }
         this.studentController.updateStudent(studentId, updatedData);
      } catch (error) {
         console.log(chalk.red(`\nError updating student: ${error.message}`));
      }
   }//✅
   // Similar methods for teacherMenu, courseMenu, reportMenu, etc.
   // I'll implement a few more key methods to demonstrate the pattern

   async teacherMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showTeacherMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.addTeacher();
               break;
            case '2':
               await this.viewAllTeachers();
               break;
            // More options...
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async addTeacher() {
      clear();
      this.view.showHeader();

      try {
         const teacherData = {
            name: readlineSync.question(chalk.blue('Enter teacher name: ')),
            email: readlineSync.question(chalk.blue('Enter teacher email: ')),
            phone: readlineSync.question(chalk.blue('Enter teacher phone: ')),
            address: readlineSync.question(chalk.blue('Enter teacher address: ')),
            birthDate: readlineSync.question(chalk.blue('Enter birth date (YYYY-MM-DD): ')),
            department: readlineSync.question(chalk.blue('Enter department: ')),
            subjects: readlineSync.question(chalk.blue('Enter subjects (comma separated): ')).split(',').map(s => s.trim()),
            qualifications: []
         };

         const teacher = this.schoolSystem.addTeacher(teacherData);
         console.log(chalk.green(`\nTeacher added successfully: ${teacher.name}`));

      } catch (error) {
         console.log(chalk.red(`\nError adding teacher: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   async courseMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showCourseMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.addCourse();
               break;
            case '2':
               await this.viewAllCourses();
               break;
            // More options...
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async enrollmentMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showEnrollmentMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.enrollStudent();
               break;
            case '2':
               await this.assignTeacher();
               break;
            // More options...
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async enrollStudent() {
      clear();
      this.view.showHeader();

      try {
         // List all students
         const students = this.schoolSystem.getAllStudents();
         if (students.length === 0) {
            throw new Error("No students found in the system");
         }

         console.log(chalk.yellow("\nAvailable Students:"));
         students.forEach((student, index) => {
            console.log(`${index + 1}. ${student.getDisplayInfo()}`);
         });

         const studentIndex = parseInt(readlineSync.question(chalk.blue('\nSelect student number: '))) - 1;
         if (studentIndex < 0 || studentIndex >= students.length) {
            throw new Error("Invalid student selection");
         }

         // List all courses
         const courses = this.schoolSystem.getAllCourses();
         if (courses.length === 0) {
            throw new Error("No courses found in the system");
         }

         console.log(chalk.yellow("\nAvailable Courses:"));
         courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} (${course.code})`);
         });

         const courseIndex = parseInt(readlineSync.question(chalk.blue('\nSelect course number: '))) - 1;
         if (courseIndex < 0 || courseIndex >= courses.length) {
            throw new Error("Invalid course selection");
         }

         // Enroll student in course
         this.schoolSystem.enrollStudentInCourse(students[studentIndex].id, courses[courseIndex].id);
         console.log(chalk.green('\nStudent successfully enrolled in the course!'));

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   async reportMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showReportMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.generateStudentReport();
               break;
            case '2':
               await this.generateCourseReport();
               break;
            case '3':
               await this.generateTeacherReport();
               break;
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async generateStudentReport() {
      clear();
      this.view.showHeader();

      try {
         const studentId = readlineSync.question(chalk.blue('Enter student ID: '));
         const report = this.schoolSystem.generateStudentReport(studentId);

         this.view.displayStudentReport(report);

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }
}

export default CLIController;