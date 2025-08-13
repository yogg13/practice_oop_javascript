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
            teacherRepository
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
            minScore: parseInt(readlineSync.question(chalk.blue('Enter minimum score: '))) || 50,
            maxScore: parseInt(readlineSync.question(chalk.blue('Enter maximum score: '))) || 100,
            type: readlineSync.question(chalk.blue('Enter assignment type (assignment/quiz): ')) || 'assignment'
         };

         await this.courseController.addAssignmentToCourse(course.id, assignmentData);
         console.log(chalk.green('\n✅ Assignment added successfully!'));
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
               await this.assignTeacherToCourse();
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
   }//✅

   // Metode untuk enroll student ke course
   async enrollStudent() {
      clear();
      this.view.showHeader("Enroll Student in Course");

      try {
         // List all students
         const students = await this.studentController.getAllStudents();
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

         // Enroll student in course
         await this.enrollmentController.enrollStudentInCourse(students[studentIndex].id, courses[courseIndex].id);
         console.log(chalk.green('\n✅ Student successfully enrolled in the course!'));

      } catch (error) {
         console.log(chalk.red(`\nError: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   // Metode untuk assign teacher ke course
   async assignTeacherToCourse() {
      clear();
      this.view.showHeader('Assign Teacher to Course');

      try {
         // 1. Get available   courses
         const courses = await this.courseController.getAllCourses();
         console.log(chalk.yellow('\nAvailable Courses:'));
         this.view.displayCourseList(courses);

         // 2. Get course ID
         const courseId = readlineSync.question(chalk.blue('\nEnter course ID: '));

         // 3. Get available teachers
         const teachers = await this.teacherController.getAllTeachers();
         console.log(chalk.yellow('\nAvailable Teachers:'));
         this.view.displayTeacherList(teachers);

         // 4. Get teacher ID
         const teacherId = readlineSync.question(chalk.blue('\nEnter teacher ID: '));

         // 5. Assign teacher to course
         await this.enrollmentController.assignTeacherToCourse(teacherId, courseId);
         console.log(chalk.green(`\n✅ Teacher assigned to course successfully`));
      } catch (error) {
         console.error(chalk.red(`\n❌ Error assigning teacher: ${error.message}`));
      }

      readlineSync.question('\nPress Enter to continue...');
   }//✅

   // Metode untuk record student grades
   async recordStudentGrade() {
      clear();
      this.view.showHeader('Record Student Grade');

      try {
         const courses = await this.courseController.getAllCourses();
         if (courses.length === 0) {
            throw new Error("No courses found in the system");
         }

         console.log(chalk.yellow("\nSelect a Course:"));
         courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} (${course.code}) - ${course._studentCount} students`);
         });

         const courseIndex = parseInt(readlineSync.question(chalk.blue('\nSelect course number: '))) - 1;
         if (courseIndex < 0 || courseIndex >= courses.length) {
            throw new Error("Invalid course selection");
         }

         // FIX 1: Gunakan properti id, bukan student
         const courseId = courses[courseIndex].id;
         console.log(`Getting details for course ID: ${courseId}`);

         // Get full course details with enrollments
         const course = await this.courseController.getCourseById(courseId);
         console.log(`Course details loaded: ${course.name}`);
         // Debug info
         console.log(`Student count: ${course._studentCount}, Has enrollments: ${course._enrolledStudents ? course._enrolledStudents.length : 'none'}`);

         // FIX 2: Cek ketersediaan enrolled students dengan benar
         if (!course._enrolledStudents || course._enrolledStudents.length === 0) {
            // Query students manually if none were loaded
            console.log("Loading enrolled students from database...");
            const enrolledStudents = await this.enrollmentController.getCourseEnrollments(courseId);

            if (!enrolledStudents || enrolledStudents.length === 0) {
               throw new Error(`No students enrolled in ${course.name}`);
            }

            console.log(`Found ${enrolledStudents.length} enrolled students`);
            course._enrolledStudents = enrolledStudents;
         }

         console.log(chalk.yellow("\nEnrolled Students:"));
         course._enrolledStudents.forEach((enrollment, index) => {
            // FIX 3: Akses data student dengan benar
            const studentName = enrollment.student_name || enrollment.student?.name || "Unknown Student";
            const studentId = enrollment.student_id || enrollment.student?.id || "Unknown ID";
            console.log(`${index + 1}. ${studentName} (${studentId})`);
         });

         const studentIndex = parseInt(readlineSync.question(chalk.blue('\nSelect student number: '))) - 1;
         if (studentIndex < 0 || studentIndex >= course._enrolledStudents.length) {
            throw new Error("Invalid student selection");
         }

         // FIX 4: Akses data student dengan benar
         const enrollment = course._enrolledStudents[studentIndex];
         // console.log("Fix-4 Enrollment details:", enrollment);
         const student = {
            id: enrollment.student?.id,
            name: enrollment.student?.name,
            gradeLevel: enrollment.student?.gradeLevel,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
         };

         console.log(chalk.yellow("\nSelect Grade Type:"));
         console.log("1. Assignment");
         console.log("2. Exam");

         const gradeTypeChoice = readlineSync.question(chalk.blue('Enter choice: '));

         if (gradeTypeChoice === '1') {

            if (course.assignments.length === 0) {
               throw new Error(`No assignments created for ${course.name}`);
            }

            console.log(chalk.yellow("\nAvailable Assignments:"));
            course.assignments.forEach((assignment, index) => {
               console.log(`${index + 1}. ${assignment.title} (Due: ${assignment.due_date.toLocaleDateString()}, Min Score: ${assignment.min_score})`);
            });

            const assignmentIndex = parseInt(readlineSync.question(chalk.blue('\nSelect assignment number: '))) - 1;
            if (assignmentIndex < 0 || assignmentIndex >= course.assignments.length) {
               throw new Error("Invalid assignment selection");
            }

            const assignment = course.assignments[assignmentIndex];

            const score = parseFloat(readlineSync.question(chalk.blue(`\nEnter score (0-${assignment.maxScore}): `)));
            if (isNaN(score) || score < 0 || score > assignment.maxScore) {
               throw new Error(`Score must be between 0 and ${assignment.maxScore}`);
            }
            try {
               const submissionData = {
                  student_id: student.id,
                  assignment_id: assignment.id,
                  submitted_at: new Date(),
                  content: "Submitted via teacher input",
                  score: score,
                  status: "graded"
               };

               // Gunakan CourseController untuk menyimpan nilai tugas
               await this.courseController.recordAssignmentGrade(
                  assignment.id,
                  student.id,
                  score,
                  "Submitted via teacher input"
               );

               console.log(chalk.green(`\n✅ Successfully recorded grade of ${score}/${assignment.max_score} for ${student.name} on ${assignment.title}`));
            } catch (error) {
               console.log(chalk.red(`\n❌ Error recording grade: ${error.message}`));
            }

         } else if (gradeTypeChoice === '2') {

            if (course.exams.length === 0) {
               throw new Error(`No exams created for ${course.name}`);
            }

            console.log(chalk.yellow("\nAvailable Exams:"));
            course.exams.forEach((exam, index) => {
               console.log(`${index + 1}. ${exam.title} (Date: ${exam.exam_date.toLocaleDateString()}, Max: ${exam.max_score})`);
            });

            const examIndex = parseInt(readlineSync.question(chalk.blue('\nSelect exam number: '))) - 1;
            if (examIndex < 0 || examIndex >= course.exams.length) {
               throw new Error("Invalid exam selection");
            }

            const exam = course.exams[examIndex];

            const score = parseFloat(readlineSync.question(chalk.blue(`\nEnter score (0-${exam.max_score}): `)));
            if (isNaN(score) || score < 0 || score > exam.max_score) {
               throw new Error(`Score must be between 0 and ${exam.max_score}`);
            }
            try {

               await this.courseController.recordExamGrade(
                  exam.id,
                  student.id,
                  score
               );
               console.log(chalk.green(`\n✅ Successfully recorded exam score of ${score}/${exam.max_score} for ${student.name} on ${exam.title}`));
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
   }//✅
   //END - Controller Input Enrollment

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