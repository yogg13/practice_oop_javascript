import chalk from 'chalk';
import figlet from 'figlet';

class CLIView {
   showHeader() {
      console.log(chalk.cyan(figlet.textSync('School Management', { horizontalLayout: 'full' })));
      console.log(chalk.yellow('='.repeat(60)));
   }

   showMainMenu() {
      console.log(chalk.yellow('MAIN MENU:\n'));
      console.log('1. Student Management');
      console.log('2. Teacher Management');
      console.log('3. Course Management');
      console.log('4. Reports');
      console.log('5. Enrollment Management');
      console.log('0. Exit');
      console.log(chalk.yellow('-'.repeat(60)));
   }

   showStudentMenu() {
      console.log(chalk.yellow('STUDENT MANAGEMENT:\n'));
      console.log('1. Add New Student');
      console.log('2. View All Students');
      console.log('3. View Student Details');
      console.log('4. Update Student Information');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(60)));
   }

   showTeacherMenu() {
      console.log(chalk.yellow('TEACHER MANAGEMENT:\n'));
      console.log('1. Add New Teacher');
      console.log('2. View All Teachers');
      console.log('3. View Teacher Details');
      console.log('4. Update Teacher Information');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(60)));
   }

   showCourseMenu() {
      console.log(chalk.yellow('COURSE MANAGEMENT:\n'));
      console.log('1. Create New Course');
      console.log('2. View All Courses');
      console.log('3. View Course Details');
      console.log('4. Update Course Information');
      console.log('5. Add Assignment to Course');
      console.log('6. Add Exam to Course');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(60)));
   }

   showEnrollmentMenu() {
      console.log(chalk.yellow('ENROLLMENT MANAGEMENT:\n'));
      console.log('1. Enroll Student in Course');
      console.log('2. Assign Teacher to Course');
      console.log('3. Record Student Attendance');
      console.log('4. Record Student Grade');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(60)));
   }

   showReportMenu() {
      console.log(chalk.yellow('REPORT GENERATION:\n'));
      console.log('1. Student Report');
      console.log('2. Course Report');
      console.log('3. Teacher Report');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(60)));
   }

   displayStudentList(students) {
      console.log(chalk.yellow('Student List:\n'));
      console.log(chalk.cyan('ID'.padEnd(30) + 'Name'.padEnd(15) + 'Role'.padEnd(15) + 'Grade Level'.padEnd(15) + 'Status'.padEnd(10)));
      console.log(chalk.yellow('-'.repeat(80)));

      students.forEach(student => {
         console.log(
            student.id.padEnd(30) +
            student.name.padEnd(15) +
            student.role.padEnd(15) +
            student.gradeLevel.padEnd(15) +
            student.academicStatus.padEnd(10)
         );
      });
   }

   displayTeacherList(teachers) {
      console.log(chalk.yellow('Teacher List:\n'));
      console.log(chalk.cyan('ID'.padEnd(15) + 'Name'.padEnd(30) + 'Department'.padEnd(20) + 'Status'));
      console.log(chalk.yellow('-'.repeat(70)));

      teachers.forEach(teacher => {
         console.log(
            teacher.id.padEnd(15) +
            teacher.name.padEnd(30) +
            teacher.department.padEnd(20) +
            teacher.employmentStatus
         );
      });
   }

   displayCourseList(courses) {
      console.log(chalk.yellow('Course List:\n'));
      console.log(chalk.cyan('ID'.padEnd(15) + 'Name'.padEnd(30) + 'Code'.padEnd(10) + 'Students'.padEnd(10) + 'Status'));
      console.log(chalk.yellow('-'.repeat(70)));

      courses.forEach(course => {
         console.log(
            course.id.padEnd(15) +
            course.name.padEnd(30) +
            course.code.padEnd(10) +
            course.studentCount.toString().padEnd(10) +
            course.status
         );
      });
   }

   displayStudentDetails(student, schoolSystem) {
      console.log(chalk.yellow('Student Details:\n'));
      console.log(chalk.cyan('Student Information:'));
      console.log(chalk.cyan('---------------------'));
      console.log(chalk.cyan('ID:'), student.id);
      console.log(chalk.cyan('Name:'), student.name);
      console.log(chalk.cyan('Email:'), student.email);
      console.log(chalk.cyan('Phone:'), student.phone);
      console.log(chalk.cyan('Address:'), student.address);
      console.log(chalk.cyan('Grade Level:'), student.gradeLevel);
      console.log(chalk.cyan('Academic Status:'), student.academicStatus);

      // Display enrolled courses
      console.log(chalk.yellow('\nEnrolled Courses:'));
      if (student.enrolledCourses.length === 0) {
         console.log('No courses enrolled');
      } else {
         console.log(chalk.cyan('Course'.padEnd(30) + 'Code'.padEnd(10) + 'Status'.padEnd(10) + 'GPA'));
         console.log('-'.repeat(60));

         student.enrolledCourses.forEach(enrollment => {
            console.log(
               enrollment.course.name.padEnd(30) +
               enrollment.course.code.padEnd(10) +
               enrollment.status.padEnd(10) +
               student.calculateCourseGPA(enrollment.course.id).toFixed(2)
            );
         });
      }

      // Display achievements if any
      if (student.achievements.length > 0) {
         console.log(chalk.yellow('\nAchievements:'));
         student.achievements.forEach(achievement => {
            console.log(`- ${achievement.title} (${achievement.category}): ${achievement.description}`);
         });
      }
   }

   displayStudentReport(report) {
      console.log(chalk.yellow('Student Report:\n'));
      console.log(chalk.cyan('Student:'), report.student.name);
      console.log(chalk.cyan('ID:'), report.student.id);
      console.log(chalk.cyan('School:'), report.student.role);
      console.log(chalk.cyan('Academic Status:'), report.academicSummary.academicStatus);
      console.log(chalk.cyan('Academic Year:'), report.academicYear);
      console.log(chalk.cyan('Report Date:'), report.generatedAt.toLocaleDateString());

      // Display course summary
      console.log(chalk.yellow('\nCourse Summary:'));
      console.log(chalk.cyan('Course'.padEnd(30) + 'Code'.padEnd(15) + 'GPA'.padEnd(10) + 'Status'));
      console.log('-'.repeat(60));

      report.academicSummary.courses.forEach(course => {
         console.log(
            course.courseName.padEnd(30) +
            course.courseCode.padEnd(15) +
            course.courseGPA.toFixed(2).padEnd(10) +
            course.status
         );
      });
   }
}

export default CLIView;