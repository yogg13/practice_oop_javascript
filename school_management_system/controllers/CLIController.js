import readlineSync from 'readline-sync';
import chalk from 'chalk';
import clear from 'clear';
import SchoolManagement from '../models/SchoolManagement.js';
import CLIView from '../views/CLIView.js';
import StudentController from './StudentController.js';
import TeacherController from './TeacherController.js';
import CourseController from './CourseController.js';

class CLIController {
   constructor() {
      this.schoolSystem = null;
      this.view = new CLIView();
      this.studentController = new StudentController();
      this.teacherController = new TeacherController();
      this.courseController = new CourseController();
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
         console.log(chalk.cyan(`Welcome to ${this.schoolSystem.schoolName} Management System - Academic Year: ${this.schoolSystem.academicYear}`));
         console.log(chalk.yellow('='.repeat(70)));
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

   //START - Controller Input Student
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
   //END - Controller Input Student

   //START - Controller Input Teacher
   async teacherMenu() {
      while (true) {
         clear();
         this.view.showHeader();
         this.view.showTeacherMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.createTeacher();
               break;
            case '2':
               await this.viewAllTeachers();
               break;
            case '3':
               await this.viewTeacherDetails();
               break;
            case '4':
               await this.updateTeacherInfo();
               break;
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   async createTeacher() {
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
            assignedClasses: readlineSync.question(chalk.blue('Enter assigned classes (optional): ')) || 'N/A',
         };

         this.teacherController.addTeacher(teacherData);
      } catch (error) {
         console.log(chalk.red(`\nError adding teacher: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async viewAllTeachers() {
      clear();
      this.view.showHeader();
      const teachers = this.teacherController.getAllTeachers();

      if (teachers.length === 0) {
         console.log(chalk.yellow('No teachers found in the system.'));
      } else {
         this.view.displayTeacherList(teachers);
      }
      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async viewTeacherDetails() {
      clear();
      this.view.showHeader();

      const teacherId = readlineSync.question(chalk.blue('Enter teacher ID: '));
      const teacher = this.teacherController.getTeacherById(teacherId);
      if (teacher) {
         this.view.displayTeacherDetails(teacher, this.schoolSystem);
      } else {
         console.log(chalk.red('Teacher not found!'));
      }
      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async updateTeacherInfo() {
      clear();
      this.view.showHeader();

      const teacherId = readlineSync.question(chalk.blue('Enter teacher ID to update: '));
      let teacher = this.teacherController.getTeacherById(teacherId);
      if (!teacher) {
         console.log(chalk.red('Teacher not found!'));
         readlineSync.question('\nPress Enter to continue...');
         return;
      }
      console.log(chalk.yellow('\nCurrent Teacher Information:'));
      this.view.displayTeacherDetails(teacher);
      console.log(chalk.yellow('\nLeave field empty to keep current value.'));

      try {
         const updatedData = {
            name: readlineSync.question(chalk.blue(`Enter new name [${teacher.name}]: `)) || '',
            email: readlineSync.question(chalk.blue(`Enter new email [${teacher.email}]: `)) || '',
            phone: readlineSync.question(chalk.blue(`Enter new phone [${teacher.phone}]: `)) || '',
            address: readlineSync.question(chalk.blue(`Enter new address [${teacher.address}]: `)) || '',
            birthDate: readlineSync.question(chalk.blue(`Enter new birth date (YYYY-MM-DD) [${teacher.birthDate}]: `)) || '',
            department: readlineSync.question(chalk.blue(`Enter new department [${teacher.department}]: `)) || '',
            subjects: readlineSync.question(chalk.blue(`Enter new subjects (comma separated) [${teacher.subjects.join(', ')}]: `)).split(',').map(s => s.trim()),
            assignedClasses: readlineSync.question(chalk.blue(`Enter new assigned classes [${teacher.assignedClasses}]: `)) || '',
         };
         this.teacherController.updateTeacher(teacherId, updatedData);
      } catch (error) {
         console.log(chalk.red(`\nError updating teacher information: ${error.message}`));
      }
      readlineSync.question('\nPress Enter to continue...');
   }//✅
   //END - Controller Input Teacher

   //START - Controller Input Course
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
            case '3':
               await this.viewCourseDetails();
               break;
            case '4':
               await this.updateCourseInfo();
               break;
            case '5':
               await this.addAssignmentToCourse();
               break;
            case '6':
               await this.addExamToCourse();
               break;
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   } //✅

   async addCourse() {
      clear();
      this.view.showHeader();

      try {
         const courseData = {
            name: readlineSync.question(chalk.blue('Enter course name: ')),
            subject: readlineSync.question(chalk.blue('Enter subject: ')),
            code: readlineSync.question(chalk.blue('Enter course code: ')),
            description: readlineSync.question(chalk.blue('Enter course description: ')),
            schedule: {
               days: readlineSync.question(chalk.blue('Enter days (comma separated): ')).split(',').map(d => d.trim()),
               time: readlineSync.question(chalk.blue('Enter time slot (e.g. 08:00-10:00): ')),
               room: readlineSync.question(chalk.blue('Enter room: '))
            }
         }
         this.courseController.addCourse(courseData);
      } catch (error) {
         console.log(chalk.red(`\nError adding course: ${error.message}`));
      }
      readlineSync.question('\nPress Enter to continue...');
   } //✅

   async viewAllCourses() {
      clear();
      this.view.showHeader();

      const courses = this.courseController.getAllCourses();
      if (courses.length === 0) {
         console.log(chalk.yellow('No courses found in the system'));
      } else {
         this.view.displayCourseList(courses);
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async viewCourseDetails() {
      clear();
      this.view.showHeader();

      const courseId = readlineSync.question(chalk.blue('Enter course ID: '));
      const course = this.courseController.getCourseById(courseId);

      if (course) {
         this.view.displayCourseDetails(course);
      } else {
         console.log(chalk.red('Course not found!'));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async updateCourseInfo() {
      clear();
      this.view.showHeader();

      const courseId = readlineSync.question(chalk.blue('Enter course ID to update: '));
      const course = this.courseController.getCourseById(courseId);

      if (!course) {
         console.log(chalk.red('Course not found!'));
         readlineSync.question('\nPress Enter to continue...');
         return;
      }

      console.log(chalk.yellow('\nCurrent Course Information:'));
      this.view.displayCourseDetails(course);
      console.log(chalk.yellow('\nLeave field empty to keep current value.'));

      try {
         const updatedData = {
            description: readlineSync.question(chalk.blue(`Enter new description [${course.description}]: `)) || '',
            schedule: {
               days: readlineSync.question(chalk.blue(`Enter new days [${course.schedule.days.join(', ')}]: `)).split(',').map(d => d.trim()),
               time: readlineSync.question(chalk.blue(`Enter new time slot [${course.schedule.time}]: `)),
               room: readlineSync.question(chalk.blue(`Enter new room [${course.schedule.room}]: `))
            },
            status: readlineSync.question(chalk.blue(`Enter new status (active/completed/cancelled) [${course.status}]: `)) || '',
         }

         //Only update if schedule fields are provided
         if (!updatedData.schedule.days[0] && !updatedData.schedule.time && !updatedData.schedule.room) {
            delete updatedData.schedule;
         }
         this.courseController.updateCourse(courseId, updatedData);
         console.log(chalk.green('\nCourse information updated successfully!'));
      } catch (error) {
         console.log(chalk.red(`\nError updating course: ${error.message}`));
      }
      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async addAssignmentToCourse() {
      clear();
      this.view.showHeader();

      try {
         // List all courses
         const courses = this.courseController.getAllCourses();
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

         const course = courses[courseIndex];

         const assignmentData = {
            title: readlineSync.question(chalk.blue('Enter assignment title: ')),
            description: readlineSync.question(chalk.blue('Enter assignment description: ')),
            dueDate: readlineSync.question(chalk.blue('Enter due date (YYYY-MM-DD): ')),
            maxScore: parseInt(readlineSync.question(chalk.blue('Enter maximum score: '))),
            type: readlineSync.question(chalk.blue('Enter assignment type (default: assignment): ')) || 'assignment'
         };

         this.courseController.addAssignmentToCourse(course.id, assignmentData);
         console.log(chalk.green('\nAssignment added successfully!'));
      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }
      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async addExamToCourse() {
      clear();
      this.view.showHeader();

      try {
         // List all courses
         const courses = this.courseController.getAllCourses();
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

         const course = courses[courseIndex];

         const examData = {
            title: readlineSync.question(chalk.blue('Enter exam title: ')),
            date: readlineSync.question(chalk.blue('Enter exam date (YYYY-MM-DD): ')),
            duration: parseInt(readlineSync.question(chalk.blue('Enter duration in minutes: '))),
            maxScore: parseInt(readlineSync.question(chalk.blue('Enter maximum score: '))),
            examType: readlineSync.question(chalk.blue('Enter exam type (quiz/midterm/final): ')) || 'exam'
         };

         this.courseController.addExamToCourse(course.id, examData);
         console.log(chalk.green('\nExam added successfully!'));

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅
   //END - Controller Input Course

   //START - Controller Input Enrollment
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
   //END - Controller Input Enrollment

   //START - Controller Input Report
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
         const report = this.studentController.generateStudentReport(studentId);

         this.view.displayStudentReport(report);

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async generateTeacherReport() {
      clear();
      this.view.showHeader();
      try {
         const teacherId = readlineSync.question(chalk.blue('Enter teacher ID: '));
         const report = this.teacherController.generateTeacherReport(teacherId);
         this.view.displayTeacherReport(report);
      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }
      readlineSync.question('\nPress Enter to continue...');
   }//✅

   async generateCourseReport() {
      clear();
      this.view.showHeader();

      try {
         const courseId = readlineSync.question(chalk.blue('Enter course ID: '));
         const report = this.courseController.generateCourseReport(courseId);
         this.view.displayCourseReport(report);
      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   //END - Controller Input Report
}

export default CLIController;