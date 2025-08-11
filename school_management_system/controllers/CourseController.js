class CourseController {
   constructor(courseRepository, assignmentRepository, examRepository) {
      this._courseRepository = courseRepository;
      this._assignmentRepository = assignmentRepository;
      this._examRepository = examRepository;
   }

   async getAllCourses() {
      return await this._courseRepository.getAllCourses();
   }

   async getCourseById(courseId) {
      return await this._courseRepository.getCourseById(courseId);
   }

   async addCourse(courseData) {
      try {
         const course = await this._courseRepository.createCourse(courseData);
         return course;
      } catch (error) {
         console.error(`❌ Failed to add course: ${error.message}`);
         throw error;
      }
   }

   async updateCourse(courseId, updatedData) {
      try {
         const course = await this._courseRepository.updateCourse(courseId, updatedData);
         return course;
      } catch (error) {
         console.error(`❌ Failed to update course: ${error.message}`);
         throw error;
      }
   }

   async assignTeacherToCourse(courseId, teacherId) {
      try {
         await this._courseRepository.assignTeacher(courseId, teacherId);
         console.log(`✅ Teacher assigned to course`);
         return await this._courseRepository.getCourseById(courseId);
      } catch (error) {
         console.error(`❌ Failed to assign teacher to course: ${error.message}`);
         throw error;
      }
   }

   async addAssignmentToCourse(courseId, assignmentData) {
      try {
         const course = await this._courseRepository.getCourseById(courseId);
         if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
         }

         const assignment = await this._assignmentRepository.createAssignment({
            ...assignmentData,
            courseId
         });

         console.log(`✅ Assignment added to course: ${assignment.title}`);
         return assignment;
      } catch (error) {
         console.error(`❌ Failed to add assignment: ${error.message}`);
         throw error;
      }
   }

   async addExamToCourse(courseId, examData) {
      try {
         const course = await this._courseRepository.getCourseById(courseId);
         if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
         }

         const exam = await this._examRepository.createExam({
            ...examData,
            courseId
         });

         console.log(`✅ Exam added to course: ${exam.title}`);
         return exam;
      } catch (error) {
         console.error(`❌ Failed to add exam: ${error.message}`);
         throw error;
      }
   }

   async generateCourseReport(courseId) {
      try {
         const course = await this._courseRepository.getCourseById(courseId);
         if (!course) {
            throw new Error(`Course with ID ${courseId} not found`);
         }

         // Get enrolled students
         const enrolledStudents = await this._courseRepository.getEnrolledStudents(courseId);

         // Get assignments and exams
         const assignments = await this._assignmentRepository.getAssignmentsByCourse(courseId);
         const exams = await this._examRepository.getExamsByCourse(courseId);

         return {
            course: {
               id: course.id,
               name: course.name,
               code: course.code,
               subject: course.subject,
               description: course.description,
               schedule: {
                  days: course.schedule.days,
                  time: course.schedule.time,
                  room: course.schedule.room
               },
               teacher: course._teacherName ? `${course._teacherName} (${course._teacherId})` : 'Not Assigned',
               status: course.status,
               studentCount: enrolledStudents.length,
               assignments: assignments.map(a => ({
                  id: a.id,
                  title: a.title,
                  dueDate: a.dueDate,
                  maxScore: a.maxScore
               })),
               exams: exams.map(e => ({
                  id: e.id,
                  title: e.title,
                  date: e.date,
                  maxScore: e.maxScore
               }))
            },
            students: enrolledStudents.map(enrollment => {
               // Mock GPA calculation for simplicity - in real app would compute from grades
               const mockGpa = Math.random() * 4;
               return {
                  student: `${enrollment.student_name} (${enrollment.student_id})`,
                  enrolledAt: enrollment.enrolled_at,
                  status: enrollment.status,
                  gpa: mockGpa
               };
            }),
            generatedAt: new Date()
         };
      } catch (error) {
         console.error(`❌ Failed to generate course report: ${error.message}`);
         throw error;
      }
   }
}

export default CourseController;