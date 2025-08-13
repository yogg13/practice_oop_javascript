class EnrollmentController {
   constructor(enrollmentRepository, studentRepository, courseRepository, teacherRepository) {
      this._enrollmentRepository = enrollmentRepository;
      this._studentRepository = studentRepository;
      this._courseRepository = courseRepository;
      this._teacherRepository = teacherRepository;
   }

   async enrollStudentInCourse(studentId, courseId) {
      try {
         // Verify student exists
         const student = await this._studentRepository.getStudentById(studentId);
         if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
         }

         // Verify course exists
         const course = await this._courseRepository.getCourseById(courseId);
         if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
         }

         // Enroll student
         const enrollment = await this._enrollmentRepository.enrollStudent(studentId, courseId);
         // console.log(`✅ Student ${student.name} enrolled in ${course.name}`);
         return enrollment;
      } catch (error) {
         console.error(`❌ Failed to enroll student: ${error.message}`);
         throw error;
      }
   }

   async dropStudentFromCourse(studentId, courseId) {
      try {
         await this._enrollmentRepository.dropStudent(studentId, courseId);
         console.log(`✅ Student dropped from course`);
         return true;
      } catch (error) {
         console.error(`❌ Failed to drop student: ${error.message}`);
         throw error;
      }
   }

   async assignTeacherToCourse(teacherId, courseId) {
      try {
         const teacher = await this._teacherRepository.getTeacherById(teacherId);
         if (!teacher) {
            throw new Error(`Teacher with ID ${teacherId} not found`);
         }

         const course = await this._courseRepository.getCourseById(courseId);
         if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
         }

         // Assign teacher to course
         await this._courseRepository.assignTeacher(courseId, teacherId);
         console.log(`✅ Teacher ${teacher.name} assigned to ${course.name}`);
         return true;
      } catch (error) {
         console.error(`❌ Failed to assign teacher to course: ${error.message}`);
         throw error;
      }
   }

   async recordGrade(studentId, courseId, gradeData) {
      try {
         // Verify student is enrolled in course
         const enrollments = await this._enrollmentRepository.getStudentEnrollments(studentId);
         const isEnrolled = enrollments.some(e => e.course_id === courseId && e.status === 'active');

         if (!isEnrolled) {
            throw new Error(`Student is not actively enrolled in this course`);
         }

         // Record the grade
         await this._enrollmentRepository.recordGrade({
            studentId,
            courseId,
            ...gradeData
         });

         console.log(`✅ Grade recorded for student`);
         return true;
      } catch (error) {
         console.error(`❌ Failed to record grade: ${error.message}`);
         throw error;
      }
   }

   async recordAssignmentGrade(assignmentId, studentId, score) {
      try {
         const assignment = await this._assignmentRepository.getAssignmentById(assignmentId);
         if (!assignment) {
            throw new Error(`Assignment with ID ${assignmentId} not found`);
         }

         // Submit and grade assignment
         await this._assignmentRepository.submitAssignment(assignmentId, studentId, "Submitted via teacher input");
         await this._assignmentRepository.gradeAssignment(assignmentId, studentId, score);

         // Also record in general grades
         await this._enrollmentRepository.recordGrade({
            studentId,
            courseId: assignment.courseId,
            type: 'assignment',
            title: assignment.title,
            score: score,
            maxScore: assignment.maxScore,
            date: new Date()
         });

         console.log(`✅ Assignment grade recorded`);
         return true;
      } catch (error) {
         console.error(`❌ Failed to record assignment grade: ${error.message}`);
         throw error;
      }
   }

   async recordExamResult(examId, studentId, score) {
      try {
         const exam = await this._examRepository.getExamById(examId);
         if (!exam) {
            throw new Error(`Exam with ID ${examId} not found`);
         }

         const startTime = new Date();
         startTime.setHours(startTime.getHours() - exam.duration / 60);
         const endTime = new Date();

         // Record exam result
         await this._examRepository.recordResult(examId, studentId, score, startTime, endTime);

         // Also record in general grades
         await this._enrollmentRepository.recordGrade({
            studentId,
            courseId: exam.courseId,
            type: 'exam',
            title: exam.title,
            score: score,
            maxScore: exam.maxScore,
            date: new Date()
         });

         console.log(`✅ Exam result recorded`);
         return true;
      } catch (error) {
         console.error(`❌ Failed to record exam result: ${error.message}`);
         throw error;
      }
   }
}

export default EnrollmentController;