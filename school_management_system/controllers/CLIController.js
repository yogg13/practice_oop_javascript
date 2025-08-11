import readlineSync from 'readline-sync';
import clear from 'clear';
import chalk from 'chalk';
import CLIView from '../views/CLIView.js';
import PostgreDB from '../database/PostgreDB.js';
import SchoolManagement from '../models/SchoolManagement.js';
import StudentRespository from '../repository/StudentRepository.js';
import TeacherRepository from '../repository/TeacherRepository.js';
import CourseRepository from '../repository/CourseRepository.js';
import AssignmentRepository from '../repository/AssignmentRepository.js';
import ExamRepository from '../repository/ExamRepository.js';
import EnrollmentRepository from '../repository/EnrollmentRepository.js';

import StudentController from './StudentController.js';
import TeacherController from './TeacherController.js';
import CourseController from './CourseController.js';
import EnrollmentController from './EnrollmentController.js';

class CLIController {
   constructor() {
      this.schoolSystem = null;
      this.view = new CLIView();
      this.db = null;

      this.studentController = null;
      this.teacherController = null;
      this.courseController = null;
      this.enrollmentController = null;
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

      try {
         console.log(chalk.yellow('\nConnecting to database...'));
         this.db = new PostgreDB();
         await this.db.connect();

         // Initialize repositories
         const studentRepository = new StudentRespository(this.db);
         const teacherRepository = new TeacherRepository(this.db);
         const courseRepository = new CourseRepository(this.db);
         const assignmentRepository = new AssignmentRepository(this.db);
         const examRepository = new ExamRepository(this.db);
         const enrollmentRepository = new EnrollmentRepository(this.db);

         // Initialize controllers with repositories
         this.studentController = new StudentController(studentRepository);
         this.teacherController = new TeacherController(teacherRepository);
         this.courseController = new CourseController(courseRepository, assignmentRepository, examRepository);
         this.enrollmentController = new EnrollmentController(
            enrollmentRepository,
            studentRepository,
            courseRepository,
            assignmentRepository,
            examRepository
         );

         console.log(chalk.green('✅ System initialized successfully!'));
         readlineSync.question('\nPress Enter to continue...');

         await this.mainMenu();
      } catch (error) {
         console.error(chalk.red(`\n❌ Error initializing system: ${error.message}`));
         readlineSync.question('\nPress Enter to exit...');
         process.exit(1);
      }
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
         await this.studentController.addStudent(studentData);
         console.log(chalk.green('✅ Student added successfully!'));
         readlineSync.question('\nPress Enter to continue...');
      } catch (error) {
         console.log(chalk.red(`\nError adding student: ${error.message}`));
      }

      // readlineSync.question('\nPress Enter to continue...');
   }//✅

   async viewAllStudents() {
      clear();
      this.view.showHeader();

      const students = await this.studentController.getAllStudents();
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
      const student = await this.studentController.getStudentById(studentId);

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
      let student = await this.studentController.getStudentById(studentId);

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
         await this.studentController.updateStudent(studentId, updatedData);
         console.log(chalk.green('✅ Student updated successfully!'));
         readlineSync.question('\nPress Enter to continue...');
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

         await this.teacherController.addTeacher(teacherData);
         console.log(chalk.green('✅ Teacher added successfully!'));
         readlineSync.question('\nPress Enter to continue...');
      } catch (error) {
         console.log(chalk.red(`\nError adding teacher: ${error.message}`));
      }
   }//✅

   async viewAllTeachers() {
      clear();
      this.view.showHeader();
      const teachers = await this.teacherController.getAllTeachers();

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
      const teacher = await this.teacherController.getTeacherById(teacherId);
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
      let teacher = await this.teacherController.getTeacherById(teacherId);
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
         await this.teacherController.updateTeacher(teacherId, updatedData);
         console.log(chalk.green('✅ Teacher updated successfully!'));
         readlineSync.question('\nPress Enter to continue...');
      } catch (error) {
         console.log(chalk.red(`\nError updating teacher information: ${error.message}`));
      }
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
               await this.createCourse();
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

   async createCourse() {
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
         await this.courseController.addCourse(courseData);
         console.log(chalk.green('✅ Course added successfully!'));
         readlineSync.question('\nPress Enter to continue...');
      } catch (error) {
         console.log(chalk.red(`\nError adding course: ${error.message}`));
      }
   } //✅

   async viewAllCourses() {
      clear();
      this.view.showHeader();

      const courses = await this.courseController.getAllCourses();
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
      const course = await this.courseController.getCourseById(courseId);

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
      const course = await this.courseController.getCourseById(courseId);

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
            name: readlineSync.question(chalk.blue(`Update new course name? [${course.name}]: `)) || '',
            code: readlineSync.question(chalk.blue(`Update new course code? [${course.code}]: `)) || '',
            subject: readlineSync.question(chalk.blue(`Update new subject? [${course.subject}]: `)) || '',
            description: readlineSync.question(chalk.blue(`Update new description? [${course.description}]: `)) || '',
            schedule: {
               days: readlineSync.question(chalk.blue(`Update new days? [${course.schedule.days.join(', ')}]: `)).split(',').map(d => d.trim()) || [],
               time: readlineSync.question(chalk.blue(`Update new time slot? [${course.schedule.time}]: `)) || '',
               room: readlineSync.question(chalk.blue(`Update new room? [${course.schedule.room}]: `)) || '',
            },
            status: readlineSync.question(chalk.blue(`Update new status (active/completed/cancelled)? [${course.status}]: `)) || '',
         }

         //Only update if schedule fields are provided
         if (!updatedData.schedule.days[0] && !updatedData.schedule.time && !updatedData.schedule.room) {
            delete updatedData.schedule;
         }
         await this.courseController.updateCourse(courseId, updatedData);
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
         const courses = await this.courseController.getAllCourses();
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
            maxScore: parseInt(readlineSync.question(chalk.blue('Enter maximum score: '))) || 100,
            type: readlineSync.question(chalk.blue('Enter assignment type (assignment/quiz): ')) || 'assignment'
         };

         await this.courseController.addAssignmentToCourse(course.id, assignmentData);
         console.log(chalk.green('\n✅ Assignment added successfully!'));
      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }
      readlineSync.question('\nPress Enter to continue...');
   }//

   async addExamToCourse() {
      clear();
      this.view.showHeader();

      try {
         // List all courses
         const courses = await this.courseController.getAllCourses();
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
            examType: readlineSync.question(chalk.blue('Enter exam type (exam/midterm/final): ')) || 'exam'
         };

         await this.courseController.addExamToCourse(course.id, examData);
         console.log(chalk.green('\n✅ Exam added successfully!'));

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//
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
            case '3':
               await this.recordStudentGrade();
               break;
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   // Metode untuk enroll student ke course
   async enrollStudent() {
      clear();
      this.view.showHeader("Enroll Student in Course");

      try {
         // List all students
         const students = this.studentController.getAllStudents();
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

         // Enroll student in course
         this.enrollmentController.enrollStudentInCourse(students[studentIndex].id, courses[courseIndex].id);
         console.log(chalk.green('\nStudent successfully enrolled in the course!'));

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   // Metode untuk assign teacher ke course
   async assignTeacher() {
      clear();
      this.view.showHeader('Assign Teacher to Course');

      try {
         // Get all teachers
         const teachers = this.teacherController.getAllTeachers();
         if (teachers.length === 0) {
            throw new Error("No teachers found in the system");
         }

         // Display available teachers
         console.log(chalk.yellow("\nAvailable Teachers:"));
         teachers.forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.name} - ${teacher.department} (Subjects: ${teacher.subjects.join(', ')})`);
         });

         // Select teacher
         const teacherIndex = parseInt(readlineSync.question(chalk.blue('\nSelect teacher number: '))) - 1;
         if (teacherIndex < 0 || teacherIndex >= teachers.length) {
            throw new Error("Invalid teacher selection");
         }

         // Get all courses
         const courses = this.courseController.getAllCourses();
         if (courses.length === 0) {
            throw new Error("No courses found in the system");
         }

         // Filter courses based on teacher subjects
         const teacher = teachers[teacherIndex];
         const eligibleCourses = courses.filter(course =>
            teacher.subjects.some(subject =>
               subject.toLowerCase() === course.subject.toLowerCase()
            )
         );

         if (eligibleCourses.length === 0) {
            throw new Error(`No courses found matching ${teacher.name}'s subjects (${teacher.subjects.join(', ')})`);
         }

         // Display eligible courses
         console.log(chalk.yellow("\nEligible Courses:"));
         eligibleCourses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} (${course.code}) - Subject: ${course.subject}`);
         });

         // Select course
         const courseIndex = parseInt(readlineSync.question(chalk.blue('\nSelect course number: '))) - 1;
         if (courseIndex < 0 || courseIndex >= eligibleCourses.length) {
            throw new Error("Invalid course selection");
         }

         const course = eligibleCourses[courseIndex];

         // Confirm assignment
         if (course.teacher) {
            const confirmReplace = readlineSync.keyInYNStrict(
               chalk.yellow(`\nThis course already has a teacher assigned (${course.teacher.name}). Replace?`)
            );
            if (!confirmReplace) {
               console.log(chalk.yellow('\nTeacher assignment cancelled.'));
               readlineSync.question('\nPress Enter to continue...');
               return;
            }
         }

         // Assign teacher to course
         try {
            course.assignTeacher(teacher);
            console.log(chalk.green(`\n✅ Successfully assigned ${teacher.name} to ${course.name}`));
         } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
         }

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   // Metode untuk record student grades
   async recordStudentGrade() {
      clear();
      this.view.showHeader('Record Student Grade');

      try {
         // Get all courses
         const courses = this.courseController.getAllCourses();
         if (courses.length === 0) {
            throw new Error("No courses found in the system");
         }

         // Display courses
         console.log(chalk.yellow("\nSelect a Course:"));
         courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} (${course.code}) - ${course.studentCount} students`);
         });

         // Select course
         const courseIndex = parseInt(readlineSync.question(chalk.blue('\nSelect course number: '))) - 1;
         if (courseIndex < 0 || courseIndex >= courses.length) {
            throw new Error("Invalid course selection");
         }

         const course = courses[courseIndex];

         // Check if course has students
         if (course.enrolledStudents.length === 0) {
            throw new Error(`No students enrolled in ${course.name}`);
         }

         // Display enrolled students
         console.log(chalk.yellow("\nEnrolled Students:"));
         course.enrolledStudents.forEach((enrollment, index) => {
            console.log(`${index + 1}. ${enrollment.student.name} (${enrollment.student.id}) - Status: ${enrollment.status}`);
         });

         // Select student
         const studentIndex = parseInt(readlineSync.question(chalk.blue('\nSelect student number: '))) - 1;
         if (studentIndex < 0 || studentIndex >= course.enrolledStudents.length) {
            throw new Error("Invalid student selection");
         }

         const student = course.enrolledStudents[studentIndex].student;

         // Select grade type
         console.log(chalk.yellow("\nSelect Grade Type:"));
         console.log("1. Assignment");
         console.log("2. Exam");

         const gradeTypeChoice = readlineSync.question(chalk.blue('Enter choice: '));

         if (gradeTypeChoice === '1') {
            // Assignment grades

            // Check if course has assignments
            if (course.assignments.length === 0) {
               throw new Error(`No assignments created for ${course.name}`);
            }

            // Display assignments
            console.log(chalk.yellow("\nAvailable Assignments:"));
            course.assignments.forEach((assignment, index) => {
               console.log(`${index + 1}. ${assignment.title} (Due: ${assignment.dueDate.toLocaleDateString()}, Max: ${assignment.maxScore})`);
            });

            // Select assignment
            const assignmentIndex = parseInt(readlineSync.question(chalk.blue('\nSelect assignment number: '))) - 1;
            if (assignmentIndex < 0 || assignmentIndex >= course.assignments.length) {
               throw new Error("Invalid assignment selection");
            }

            const assignment = course.assignments[assignmentIndex];

            // Enter score
            const score = parseFloat(readlineSync.question(chalk.blue(`\nEnter score (0-${assignment.maxScore}): `)));
            if (isNaN(score) || score < 0 || score > assignment.maxScore) {
               throw new Error(`Score must be between 0 and ${assignment.maxScore}`);
            }

            // Record submission and grade
            try {
               // First record submission
               assignment.submitAssignment(student.id, "Submitted via teacher input", new Date());
               // Then grade it
               assignment.gradeAssignment(student.id, score);

               // Add to student's grades
               student.addGrade(course.id, {
                  type: 'assignment',
                  title: assignment.title,
                  score: score,
                  maxScore: assignment.maxScore,
                  date: new Date()
               });

               console.log(chalk.green(`\n✅ Successfully recorded grade of ${score}/${assignment.maxScore} for ${student.name} on ${assignment.title}`));
            } catch (error) {
               console.log(chalk.red(`\n❌ Error recording grade: ${error.message}`));
            }

         } else if (gradeTypeChoice === '2') {
            // Exam grades

            // Check if course has exams
            if (course.exams.length === 0) {
               throw new Error(`No exams created for ${course.name}`);
            }

            // Display exams
            console.log(chalk.yellow("\nAvailable Exams:"));
            course.exams.forEach((exam, index) => {
               console.log(`${index + 1}. ${exam.title} (Date: ${exam.date.toLocaleDateString()}, Max: ${exam.maxScore})`);
            });

            // Select exam
            const examIndex = parseInt(readlineSync.question(chalk.blue('\nSelect exam number: '))) - 1;
            if (examIndex < 0 || examIndex >= course.exams.length) {
               throw new Error("Invalid exam selection");
            }

            const exam = course.exams[examIndex];

            // Enter score
            const score = parseFloat(readlineSync.question(chalk.blue(`\nEnter score (0-${exam.maxScore}): `)));
            if (isNaN(score) || score < 0 || score > exam.maxScore) {
               throw new Error(`Score must be between 0 and ${exam.maxScore}`);
            }

            // Record exam result
            try {
               const startTime = new Date();
               startTime.setHours(startTime.getHours() - exam.duration / 60);
               const endTime = new Date();

               // Record result in exam
               exam.recordResult(student.id, score, startTime, endTime);

               // Add to student's grades
               student.addGrade(course.id, {
                  type: 'exam',
                  title: exam.title,
                  score: score,
                  maxScore: exam.maxScore,
                  date: new Date()
               });

               console.log(chalk.green(`\n✅ Successfully recorded exam score of ${score}/${exam.maxScore} for ${student.name} on ${exam.title}`));
            } catch (error) {
               console.log(chalk.red(`\n❌ Error recording exam result: ${error.message}`));
            }

         } else {
            throw new Error("Invalid grade type selection");
         }

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
         this.view.showHeader('Report Generation');
         this.view.showReportMenu();

         const choice = readlineSync.question(chalk.yellow('Select an option: '));

         switch (choice) {
            case '1':
               await this.studentReportMenu();
               break;
            case '2':
               await this.teacherReportMenu();
               break;
            case '3':
               await this.courseReportMenu();
               break;
            case '4':
               await this.generateSystemOverview();
               break;
            case '0':
               return;
            default:
               console.log(chalk.red('Invalid option. Please try again.'));
               readlineSync.question('Press Enter to continue...');
         }
      }
   }

   //Student Report Menu
   async studentReportMenu() {
      clear();
      this.view.showHeader('Student Report Options');
      console.log('1. Generate Individual Student Report');
      console.log('2. Generate All Students Summary');
      // console.log('3. Generate Grade Level Report');
      // console.log('4. Generate Student Achievement Report');
      console.log('0. Back to Reports Menu');
      console.log(chalk.yellow('-'.repeat(70)));

      const choice = readlineSync.question(chalk.yellow('Select an option: '));

      switch (choice) {
         case '1':
            await this.generateIndividualStudentReport();
            break;
         case '2':
            await this.generateAllStudentsSummary();
            break;
         // case '3':
         //    await this.generateGradeLevelReport();
         //    break;
         // case '4':
         //    await this.generateStudentAchievementReport();
         //    break;
         case '0':
            return;
         default:
            console.log(chalk.red('Invalid option. Please try again.'));
            readlineSync.question('Press Enter to continue...');
      }
   }

   // Teacher Report Menu
   async teacherReportMenu() {
      clear();
      this.view.showHeader('Teacher Report Options');
      console.log('1. Generate Individual Teacher Report');
      console.log('2. Generate Department Summary');
      console.log('3. Generate Teaching Load Report');
      console.log('0. Back to Reports Menu');
      console.log(chalk.yellow('-'.repeat(70)));

      const choice = readlineSync.question(chalk.yellow('Select an option: '));

      switch (choice) {
         case '1':
            await this.generateIndividualTeacherReport();
            break;
         // case '2':
         //    await this.generateDepartmentSummary();
         //    break;
         // case '3':
         //    await this.generateTeachingLoadReport();
         //    break;
         case '0':
            return;
         default:
            console.log(chalk.red('Invalid option. Please try again.'));
            readlineSync.question('Press Enter to continue...');
      }
   }

   // Course Report Menu
   async courseReportMenu() {
      clear();
      this.view.showHeader('Course Report Options');
      console.log('1. Generate Individual Course Report');
      console.log('2. Generate Course Enrollment Summary');
      // console.log('3. Generate Course Performance Report');
      console.log('0. Back to Reports Menu');
      console.log(chalk.yellow('-'.repeat(70)));

      const choice = readlineSync.question(chalk.yellow('Select an option: '));

      switch (choice) {
         case '1':
            await this.generateIndividualCourseReport();
            break;
         case '2':
            await this.generateCourseEnrollmentSummary();
            break;
         // case '3':
         //    await this.generateCoursePerformanceReport();
         //    break;
         case '0':
            return;
         default:
            console.log(chalk.red('Invalid option. Please try again.'));
            readlineSync.question('Press Enter to continue...');
      }
   }

   // Implementasi untuk Individual Student Report (dengan seleksi siswa yang ditingkatkan)
   async generateIndividualStudentReport() {
      clear();
      this.view.showHeader('Generate Individual Student Report');

      try {
         // Get all students
         const students = this.studentController.getAllStudents();
         if (students.length === 0) {
            throw new Error("No students found in the system");
         }

         // Display list of students
         console.log(chalk.yellow("\nSelect a student:"));
         students.forEach((student, index) => {
            console.log(`${index + 1}. ${student.name} (${student.id}) - Grade ${student.gradeLevel}`);
         });

         // Let user select a student
         const studentIndex = parseInt(readlineSync.question(chalk.blue('\nEnter student number: '))) - 1;
         if (studentIndex < 0 || studentIndex >= students.length) {
            throw new Error("Invalid student selection");
         }

         // Generate and display report
         const studentId = students[studentIndex].id;
         const report = this.studentController.generateStudentReport(studentId);

         // Add academic year to report
         report.academicYear = this.schoolSystem.academicYear;

         this.view.displayStudentReport(report);

         // Offer to export report
         if (readlineSync.keyInYNStrict(chalk.blue('\nWould you like to export this report?'))) {
            // Simple export - in real app, would write to file
            console.log(chalk.green('\nReport exported successfully!'));
            console.log(chalk.gray('(In a real application, this would save to a file)'));
         }

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   // Implementasi untuk All Students Summary
   async generateAllStudentsSummary() {
      clear();
      this.view.showHeader('All Students Summary');

      try {
         const students = this.studentController.getAllStudents();
         if (students.length === 0) {
            throw new Error("No students found in the system");
         }

         // Calculate statistics
         const stats = {
            totalStudents: students.length,
            byGradeLevel: {
               '10': students.filter(s => s.gradeLevel === '10').length,
               '11': students.filter(s => s.gradeLevel === '11').length,
               '12': students.filter(s => s.gradeLevel === '12').length
            },
            byStatus: {
               active: students.filter(s => s.academicStatus === 'active').length,
               suspended: students.filter(s => s.academicStatus === 'suspended').length,
               graduated: students.filter(s => s.academicStatus === 'graduated').length,
               transferred: students.filter(s => s.academicStatus === 'transferred').length
            },
            averageCoursesPerStudent: students.reduce((sum, student) => sum + student.enrolledCourses.length, 0) / students.length
         };

         // Display the summary report
         console.log(chalk.cyan(`\nTotal Students: ${stats.totalStudents}`));
         console.log(chalk.cyan(`Academic Year: ${this.schoolSystem.academicYear}`));

         console.log(chalk.yellow('\nDistribution by Grade Level:'));
         console.log(`Grade 10: ${stats.byGradeLevel['10']} students`);
         console.log(`Grade 11: ${stats.byGradeLevel['11']} students`);
         console.log(`Grade 12: ${stats.byGradeLevel['12']} students`);

         console.log(chalk.yellow('\nDistribution by Status:'));
         console.log(`Active: ${stats.byStatus.active} students`);
         console.log(`Suspended: ${stats.byStatus.suspended} students`);
         console.log(`Graduated: ${stats.byStatus.graduated} students`);
         console.log(`Transferred: ${stats.byStatus.transferred} students`);

         console.log(chalk.yellow('\nCourse Enrollment:'));
         console.log(`Average Courses per Student: ${stats.averageCoursesPerStudent.toFixed(1)}`);

         // Display top 5 students by GPA (if there are courses and grades)
         const studentsWithGPA = students.filter(student => student.enrolledCourses.length > 0);
         if (studentsWithGPA.length > 0) {
            console.log(chalk.yellow('\nTop 5 Students by Overall GPA:'));

            // Calculate overall GPA for each student
            const studentsWithOverallGPA = studentsWithGPA.map(student => {
               const courseGPAs = student.enrolledCourses.map(course =>
                  student.calculateCourseGPA(course.course.id)
               );
               const overallGPA = courseGPAs.reduce((sum, gpa) => sum + gpa, 0) / courseGPAs.length;

               return {
                  id: student.id,
                  name: student.name,
                  gradeLevel: student.gradeLevel,
                  overallGPA
               };
            });

            // Sort and display top 5
            studentsWithOverallGPA
               .sort((a, b) => b.overallGPA - a.overallGPA)
               .slice(0, 5)
               .forEach((student, index) => {
                  console.log(`${index + 1}. ${student.name} (Grade ${student.gradeLevel}) - GPA: ${student.overallGPA.toFixed(2)}`);
               });
         }

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   // Implementasi Individual Teacher Report
   async generateIndividualTeacherReport() {
      clear();
      this.view.showHeader('Generate Individual Teacher Report');

      try {
         // Get all teachers
         const teachers = this.teacherController.getAllTeachers();
         if (teachers.length === 0) {
            throw new Error("No teachers found in the system");
         }

         // Display list of teachers
         console.log(chalk.yellow("\nSelect a teacher:"));
         teachers.forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.name} - ${teacher.department} Department (${teacher.id})`);
         });

         // Let user select a teacher
         const teacherIndex = parseInt(readlineSync.question(chalk.blue('\nEnter teacher number: '))) - 1;
         if (teacherIndex < 0 || teacherIndex >= teachers.length) {
            throw new Error("Invalid teacher selection");
         }

         // Generate and display report
         const teacherId = teachers[teacherIndex].id;
         const report = this.teacherController.generateTeacherReport(teacherId);

         // Display the report
         this.view.displayTeacherReport(report.teachingSummary);

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   // Implementasi Individual Course Report
   async generateIndividualCourseReport() {
      clear();
      this.view.showHeader('Generate Individual Course Report');

      try {
         // Get all courses
         const courses = this.courseController.getAllCourses();
         if (courses.length === 0) {
            throw new Error("No courses found in the system");
         }

         // Display list of courses
         console.log(chalk.yellow("\nSelect a course:"));
         courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} (${course.code}) - ${course.studentCount} students`);
         });

         // Let user select a course
         const courseIndex = parseInt(readlineSync.question(chalk.blue('\nEnter course number: '))) - 1;
         if (courseIndex < 0 || courseIndex >= courses.length) {
            throw new Error("Invalid course selection");
         }

         // Generate and display report
         const courseId = courses[courseIndex].id;
         const report = this.courseController.generateCourseReport(courseId);

         // Add more details to the report
         if (report.course.teacher !== 'Not Assigned') {
            const teacherId = report.course.teacher.split('(')[1].split(')')[0]; // Extract ID from display string
            const teacher = this.teacherController.getTeacherById(teacherId);
            if (teacher) {
               report.teacherDetails = {
                  name: teacher.name,
                  department: teacher.department,
                  subjects: teacher.subjects
               };
            }
         }

         // Display the report with enhanced information
         this.view.displayEnhancedCourseReport(report);

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   //Implementasi for Summary Course in Enrollment
   async generateCourseEnrollmentSummary() {
      clear();
      this.view.showHeader('Course Enrollment Summary');

      try {
         // Get all courses
         const courses = this.courseController.getAllCourses();
         if (courses.length === 0) {
            throw new Error("No courses found in the system");
         }

         // Calculate basic statistics
         const totalCourses = courses.length;
         const activeCourses = courses.filter(c => c.status === 'active').length;
         const totalEnrollments = courses.reduce((sum, course) => sum + course.studentCount, 0);
         const averageClassSize = totalEnrollments / totalCourses;

         // Group by subject
         const subjectGroups = {};
         courses.forEach(course => {
            if (!subjectGroups[course.subject]) {
               subjectGroups[course.subject] = {
                  courses: 0,
                  students: 0
               };
            }
            subjectGroups[course.subject].courses++;
            subjectGroups[course.subject].students += course.studentCount;
         });

         // Display summary
         console.log(chalk.cyan(`\nAcademic Year: ${this.schoolSystem.academicYear}`));
         console.log(chalk.cyan(`Report Date: ${new Date().toLocaleDateString()}`));

         console.log(chalk.yellow('\nEnrollment Overview:'));
         console.log(`Total Courses: ${totalCourses}`);
         console.log(`Active Courses: ${activeCourses}`);
         console.log(`Total Enrollments: ${totalEnrollments}`);
         console.log(`Average Class Size: ${averageClassSize.toFixed(1)} students`);

         // Display courses by enrollment size (descending)
         console.log(chalk.yellow('\nCourses by Enrollment (Top 5):'));
         courses
            .sort((a, b) => b.studentCount - a.studentCount)
            .slice(0, 5)
            .forEach((course, index) => {
               console.log(`${index + 1}. ${course.name} (${course.code}): ${course.studentCount} students`);
            });

         // Display enrollment by subject
         console.log(chalk.yellow('\nEnrollment by Subject:'));
         Object.entries(subjectGroups)
            .sort((a, b) => b[1].students - a[1].students)
            .forEach(([subject, data]) => {
               console.log(`${subject}: ${data.courses} courses, ${data.students} students (${(data.students / totalEnrollments * 100).toFixed(1)}% of total)`);
            });

         // Check for potential issues
         console.log(chalk.yellow('\nEnrollment Alerts:'));

         const lowEnrollmentCourses = courses.filter(c => c.status === 'active' && c.studentCount < 5);
         if (lowEnrollmentCourses.length > 0) {
            console.log(chalk.red(`${lowEnrollmentCourses.length} active courses have fewer than 5 students enrolled`));
            lowEnrollmentCourses.forEach(course => {
               console.log(`- ${course.name} (${course.code}): ${course.studentCount} students`);
            });
         } else {
            console.log(chalk.green('No courses with critically low enrollment'));
         }

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }

   // System Overview Report
   async generateSystemOverview() {
      clear();
      this.view.showHeader('System Overview Report');

      try {
         const students = this.studentController.getAllStudents();
         const teachers = this.teacherController.getAllTeachers();
         const courses = this.courseController.getAllCourses();

         console.log(chalk.cyan(`\nSchool: ${this.schoolSystem.schoolName}`));
         console.log(chalk.cyan(`Academic Year: ${this.schoolSystem.academicYear}`));
         console.log(chalk.cyan(`Report Date: ${new Date().toLocaleDateString()}`));

         console.log(chalk.yellow('\nSystem Statistics:'));
         console.log(`Total Students: ${students.length}`);
         console.log(`Total Teachers: ${teachers.length}`);
         console.log(`Total Courses: ${courses.length}`);
         console.log(`Student-Teacher Ratio: ${teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : 'N/A'}`);

         console.log(chalk.yellow('\nEnrollment Summary:'));
         const activeCourses = courses.filter(c => c.status === 'active');
         const totalEnrollments = activeCourses.reduce((sum, course) => sum + course.studentCount, 0);
         console.log(`Active Courses: ${activeCourses.length}`);
         console.log(`Total Enrollments: ${totalEnrollments}`);
         console.log(`Average Students per Course: ${activeCourses.length > 0 ? (totalEnrollments / activeCourses.length).toFixed(1) : 'N/A'}`);

         // Display top 3 most popular courses
         if (activeCourses.length > 0) {
            console.log(chalk.yellow('\nTop 3 Most Popular Courses:'));
            activeCourses
               .sort((a, b) => b.studentCount - a.studentCount)
               .slice(0, 3)
               .forEach((course, index) => {
                  console.log(`${index + 1}. ${course.name} (${course.code}) - ${course.studentCount} students`);
               });
         }

         // Display department distribution
         if (teachers.length > 0) {
            console.log(chalk.yellow('\nTeacher Department Distribution:'));
            const departments = {};
            teachers.forEach(teacher => {
               if (!departments[teacher.department]) {
                  departments[teacher.department] = 0;
               }
               departments[teacher.department]++;
            });

            Object.entries(departments)
               .sort((a, b) => b[1] - a[1])
               .forEach(([dept, count]) => {
                  console.log(`${dept}: ${count} teachers (${((count / teachers.length) * 100).toFixed(1)}%)`);
               });
         }

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }
   //END - Controller Input Report

   async shutDown() {
      if (this.db) {
         try {
            await this.db.disconnect();
         } catch (error) {
            console.error(chalk.red(`\n❌ Error disconnecting from database: ${error.message}`));
         }
      }
      console.log(chalk.green('\n👋 Thank you for using the School Management System!'));
      process.exit(0);
   }
}

export default CLIController;