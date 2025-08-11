import readlineSync from 'readline-sync';
import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';

class CLIView {
   showHeader() {
      console.log(chalk.cyan(figlet.textSync('School Management', { horizontalLayout: 'full' })));
      console.log(chalk.yellow('='.repeat(70)));
   }

   showMainMenu() {
      console.log(chalk.yellow('MAIN MENU:\n'));
      console.log('1. Student Management');
      console.log('2. Teacher Management');
      console.log('3. Course Management');
      console.log('4. Reports');
      console.log('5. Enrollment Management');
      console.log('0. Exit');
      console.log(chalk.yellow('-'.repeat(70)));
   }

   showStudentMenu() {
      console.log(chalk.yellow('STUDENT MANAGEMENT:\n'));
      console.log('1. Add New Student');
      console.log('2. View All Students');
      console.log('3. View Student Details');
      console.log('4. Update Student Information');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(70)));
   }

   showTeacherMenu() {
      console.log(chalk.yellow('TEACHER MANAGEMENT:\n'));
      console.log('1. Add New Teacher');
      console.log('2. View All Teachers');
      console.log('3. View Teacher Details');
      console.log('4. Update Teacher Information');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(70)));
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
      console.log(chalk.yellow('-'.repeat(70)));
   }

   showEnrollmentMenu() {
      console.log(chalk.yellow('ENROLLMENT MANAGEMENT:\n'));
      console.log('1. Enroll Student in Course');
      console.log('2. Assign Teacher to Course');
      console.log('3. Record Student Grade');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(70)));
   }

   showReportMenu() {
      console.log(chalk.yellow('REPORTS:\n'));
      console.log('1. Generate Student Report');
      console.log('2. Generate Teacher Report');
      console.log('3. Generate Course Report');
      console.log('0. Back to Main Menu');
      console.log(chalk.yellow('-'.repeat(70)));
   }

   displayStudentList(students) {
      console.log(chalk.yellow('Student List:'));
      console.log(chalk.cyan('ID'.padEnd(30) + 'Name'.padEnd(15) + 'Role'.padEnd(15) + 'Grade Level'.padEnd(15) + 'Status'.padEnd(10) + 'Enrolled Courses'.padEnd(20)));
      console.log(chalk.yellow('-'.repeat(90)));
      students.forEach((student) => {
         console.log(
            student.id.padEnd(30) +
            student.name.padEnd(15) +
            student.role.padEnd(15) +
            student.gradeLevel.padEnd(15) +
            student.academicStatus.padEnd(10) +
            student.enrolledCourses.length.toString().padEnd(20)
         );
      });//✅

   }
   displayTeacherList(teachers) {
      console.log(chalk.yellow('Teacher List:\n'));
      // console.log(chalk.cyan('ID'.padEnd(15) + 'Name'.padEnd(30) + 'Department'.padEnd(20) + 'Status'));
      console.log(chalk.yellow('-'.repeat(90)));

      teachers.forEach((teacher) => {
         console.table([
            {
               ID: teacher.id,
               Name: teacher.name,
               Department: teacher.department,
               Subjects: teacher.subjects.join(', '),
               'Assigned Classes': teacher.assignedClasses,
               'Assigned Courses': teacher.assignedCourses.map(course => course.name).join(', ') || 'N/A',
               'Teaching Load': teacher.getTeachingLoad(),
               Status: teacher.employmentStatus
            }
         ]);
      });
   }//✅

   displayCourseList(courses) {
      console.log(chalk.yellow('Course List:\n'));
      console.log(chalk.cyan('ID'.padEnd(30) + 'Name'.padEnd(30) + 'Code'.padEnd(10) + 'Students'.padEnd(10) + 'Status'));
      console.log(chalk.yellow('-'.repeat(90)));

      courses.forEach(course => {
         console.log(
            course.id.padEnd(30) +
            course.name.padEnd(30) +
            course.code.padEnd(10) +
            course.studentCount.toString().padEnd(10) +
            course.status
         );
      });
   }//✅

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
   }//✅

   displayTeacherDetails(teacher, schoolSystem) {
      console.log(chalk.yellow('Teacher Details:\n'));
      console.log(chalk.cyan('ID:'), teacher.id);

      console.log(chalk.yellow('Teacher Details:\n'));
      console.log(chalk.cyan('Teacher Information:'));
      console.log(chalk.cyan('---------------------'));
      console.log(chalk.cyan('ID:'), teacher.id);
      console.log(chalk.cyan('Name:'), teacher.name);
      console.log(chalk.cyan('Email:'), teacher.email);
      console.log(chalk.cyan('Phone:'), teacher.phone);
      console.log(chalk.cyan('Department:'), teacher.department);
      console.log(chalk.cyan('Subjects:'), teacher.subjects.join(', '));
      console.log(chalk.cyan('Assigned Classes:'), teacher.assignedClasses);
      console.log(chalk.cyan('Assigned Courses:'), teacher.assignedCourses.map(course => course.name).join(', '));
      console.log(chalk.cyan('Teaching Load:'), teacher.getTeachingLoad());
      console.log(chalk.cyan('Employment Status:'), teacher.employmentStatus);
   }//✅

   displayCourseDetails(course) {
      console.log(chalk.yellow('Course Details:\n'));
      console.log(chalk.cyan('Course Information:'));
      console.log(chalk.cyan('-------------------'));
      console.log(chalk.cyan('ID:'), course.id);
      console.log(chalk.cyan('Name:'), course.name);
      console.log(chalk.cyan('Subject:'), course.subject);
      console.log(chalk.cyan('Code:'), course.code);
      console.log(chalk.cyan('Description:'), course.description);
      console.log(chalk.cyan('Schedule:'),
         `Days: ${course.schedule.days.join(', ')}, Time: ${course.schedule.time}, Room: ${course.schedule.room}`);
      console.log(chalk.cyan('Teacher:'), course.teacher ? course.teacher.getDisplayInfo() : 'Not Assigned');
      console.log(chalk.cyan('Status:'), course.status);

      // Display enrolled students
      console.log(chalk.yellow('\nEnrolled Students:'));
      if (course.enrolledStudents.length === 0) {
         console.log('No students enrolled in this course');
      } else {
         console.log(chalk.cyan('Name'.padEnd(30) + 'Status'.padEnd(15) + 'Enrolled At'));
         console.log('-'.repeat(60));

         course.enrolledStudents.forEach(enrollment => {
            console.log(
               enrollment.student.name.padEnd(30) +
               enrollment.status.padEnd(15) +
               enrollment.enrolledAt.toLocaleDateString()
            );
         });
      }

      // Display assignments
      console.log(chalk.yellow('\nAssignments:'));
      if (course.assignments.length === 0) {
         console.log('No assignments created for this course');
      } else {
         course.assignments.forEach(assignment => {
            console.log(`- ${assignment.title} (Due: ${assignment.dueDate.toLocaleDateString()}, Max Score: ${assignment.maxScore})`);
         });
      }

      // Display exams
      console.log(chalk.yellow('\nExams:'));
      if (course.exams.length === 0) {
         console.log('No exams scheduled for this course');
      } else {
         course.exams.forEach(exam => {
            console.log(`- ${exam.title} (${exam.date.toLocaleDateString()}, Duration: ${exam.duration} mins, Max Score: ${exam.maxScore})`);
         });
      }
   }

   displayEnhancedCourseReport(report) {
      console.log(chalk.yellow('Enhanced Course Report:\n'));
      console.log(chalk.cyan('Course Information:'));
      console.log(chalk.cyan('-------------------'));
      console.log(chalk.cyan('Course Name:'), report.course.name);
      console.log(chalk.cyan('Course Code:'), report.course.code);
      console.log(chalk.cyan('Subject:'), report.course.subject);
      console.log(chalk.cyan('Status:'), report.course.status);

      // Teacher information
      console.log(chalk.yellow('\nInstructor Information:'));
      if (report.course.teacher === 'Not Assigned') {
         console.log('No instructor assigned');
      } else {
         console.log(chalk.cyan('Teacher:'), report.course.teacher);
         if (report.teacherDetails) {
            console.log(chalk.cyan('Department:'), report.teacherDetails.department);
            console.log(chalk.cyan('Specializations:'), report.teacherDetails.subjects.join(', '));
         }
      }

      // Student enrollment details
      console.log(chalk.yellow('\nEnrollment Summary:'));
      console.log(chalk.cyan('Total Students:'), report.course.studentCount);

      if (report.students && report.students.length > 0) {
         console.log(chalk.yellow('\nStudent Performance:'));
         console.log(chalk.cyan('Student'.padEnd(30) + 'Status'.padEnd(15) + 'GPA'.padEnd(10) + 'Enrolled Date'));
         console.log('-'.repeat(70));

         report.students.forEach(student => {
            console.log(
               student.student.split('(')[0].trim().padEnd(30) +
               student.status.padEnd(15) +
               student.gpa.toFixed(2).padEnd(10) +
               new Date(student.enrolledAt).toLocaleDateString()
            );
         });

         // Calculate average GPA
         const avgGPA = report.students.reduce((sum, student) => sum + student.gpa, 0) / report.students.length;
         console.log(chalk.cyan(`\nClass Average GPA: ${avgGPA.toFixed(2)}`));
      }

      // Display assignments and exams
      if (report.course.assignments && report.course.assignments.length > 0) {
         console.log(chalk.yellow('\nAssessments:'));
         console.log(chalk.cyan('Assignments:'));
         report.course.assignments.forEach(assignment => {
            console.log(`- ${assignment.title} (Due: ${new Date(assignment.dueDate).toLocaleDateString()})`);
         });
      }

      if (report.course.exams && report.course.exams.length > 0) {
         console.log(chalk.cyan('\nExams:'));
         report.course.exams.forEach(exam => {
            console.log(`- ${exam.title} (${new Date(exam.date).toLocaleDateString()})`);
         });
      }

      console.log(chalk.yellow('\nReport Generated:'), report.generatedAt.toLocaleDateString());
   }

}

export default CLIView;