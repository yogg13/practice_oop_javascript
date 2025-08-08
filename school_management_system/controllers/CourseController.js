import Course from "../models/Course.js";

class CourseController {
   constructor() {
      this._courses = new Map();
   }

   getCourseById(courseId) { return this._courses.get(courseId); }
   getAllCourses() { return Array.from(this._courses.values()); }

   addCourse(courseData) {
      try {
         const course = new Course(
            courseData.name,
            courseData.subject,
            courseData.code,
            courseData.description,
            courseData.schedule,
         )
         this._courses.set(course.id, course);
         console.log(`✅ Course added: ${course.name} - ${course.code}`);
      } catch (error) {
         console.error(`❌ Failed to add course: ${error.message}`);
      }
   }

   updateCourse(courseId, updatedData) {
      const course = this.getCourseById(courseId);
      if (!course) {
         throw new Error(`Course with ID ${courseId} not found`);
      }

      try {
         if (updatedData.description && typeof updatedData.description === 'object') {
            course.description = updatedData.description;
         }
         if (updatedData.schedule && typeof updatedData.schedule === 'object') {
            course.schedule = updatedData.schedule;
         }
         if (updatedData.status && typeof updatedData.status.trim() !== '') {
            course.status = updatedData.status;
         }
         console.log(`✅ Course updated: ${course.name} - ${course.code}`);
      } catch (error) {
         console.error(`❌ Failed to update course: ${error.message}`);
      }
   }

   addAssignmentToCourse(courseId, assignmentData) {
      const course = this.getCourseById(courseId);
      if (!course) {
         throw new Error(`Course with ID ${courseId} not found`);
      }

      try {
         const assignment = course.createAssignment(
            assignmentData.title,
            assignmentData.description,
            assignmentData.dueDate,
            assignmentData.maxScore,
            assignmentData.type,
         );
         console.log(`✅ Assignment added to course: ${assignment.title}`);
      } catch (error) {
         console.error(`❌ Failed to add assignment: ${error.message}`);
      }
   }

   addExamToCourse(courseId, examData) {
      const course = this.getCourseById(courseId);
      if (!course) {
         throw new Error(`Course with ID ${courseId} not found`);
      }

      try {
         const exam = course.createExam(
            examData.title,
            examData.date,
            examData.duration,
            examData.maxScore,
            examData.examType,
         );
         console.log(`✅ Exam added to course: ${exam.title}`);
      } catch (error) {
         console.error(`❌ Failed to add exam: ${error.message}`);
      }
   }


   generateCourseReport(courseId) {
      const course = this._courses.get(courseId);
      if (!course) throw new Error("Course not found");

      return {
         course: course.getCourseInfo(),
         students: course.enrolledStudents.map(enrollment => ({
            student: enrollment.student.getDisplayInfo(),
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
            gpa: enrollment.student.calculateCourseGPA(courseId),
         })),
         generatedAt: new Date(),
      };
   }
}

export default CourseController;