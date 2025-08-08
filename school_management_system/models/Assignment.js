class Assignment {
   constructor(title, description, dueDate, maxScore, type, courseId) {
      this._id = this._generateAssignmentId();
      this._title = title;
      this._description = description;
      this._dueDate = new Date(dueDate);
      this._maxScore = maxScore;
      this._type = type;
      this._courseId = courseId;
      this._submissions = new Map();
      this._createdAt = new Date();
      this._status = 'active'; // active, close
   }

   // Getters
   get id() { return this._id; }
   get title() { return this._title; }
   get description() { return this._description; }
   get dueDate() { return new Date(this._dueDate); }
   get maxScore() { return this._maxScore; }
   get type() { return this._type; }
   get courseId() { return this._courseId; }
   get submissions() { return Array.from(this._submissions.values()); }
   get status() { return this._status; }

   //Setters
   set status(newStatus) {
      const validStatus = ['active', 'closed'];
      if (!validStatus.includes(newStatus)) {
         throw new Error("Invalid assignment status");
      }
      this._status = newStatus;
   }

   _generateAssignmentId() {
      return `ASG-${Math.random().toString(36).substring(2, 9)}`;
   }

   submitAssignment(studentId, content, submittedAt = new Date()) {
      if (this._status !== 'active') {
         throw new Error("Assignment is closed for submissions");
      }

      const submission = {
         studentId: studentId,
         content: content,
         submittedAt: new Date(submittedAt),
         isLate: new Date(submittedAt) > this._dueDate,
         score: null,
         gradedAt: null,
         status: 'submitted' // submitted, graded
      }

      this._submissions.set(studentId, submission);
      return submission;
   }

   gradeAssignment(studentId, score) {
      const submission = this._submissions.get(studentId);
      if (!submission) {
         throw new Error("No submission found for this student");
      }

      if (score < 0 || score > this._maxScore) {
         throw new Error(`Score must be between 0 and ${this._maxScore}`);
      }

      submission.score = score;
      submission.gradedAt = new Date();
      submission.status = 'graded';

      return submission;
   }

   getAverageScore() {
      const gradedAssignment = Array.from(this._submissions.values())
         .filter(item => item.score !== null);

      if (gradedAssignment.length === 0) return 0;

      const totalScore = gradedAssignment.reduce((sum, sub) => sum + sub.score, 0);
      return totalScore / gradedAssignment.length;
   }
}

export default Assignment;