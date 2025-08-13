class Assignment {
   constructor(title, description, dueDate, minScore, maxScore, type, courseId) {
      this._id = this._generateAssignmentId();
      this._title = title;
      this._description = description;
      this._dueDate = new Date(dueDate);
      this._minScore = minScore;
      this._maxScore = maxScore;
      this._type = type;
      this._courseId = courseId;
      this._submissions = new Map();
      this._createdAt = new Date();
      this._status = 'active'; // active, close, submitted, graded
   }

   // Getters
   get id() { return this._id; }
   get title() { return this._title; }
   get description() { return this._description; }
   get dueDate() { return new Date(this._dueDate); }
   get minScore() { return this._minScore; }
   get maxScore() { return this._maxScore; }
   get type() { return this._type; }
   get courseId() { return this._courseId; }
   get submissions() { return Array.from(this._submissions.values()); }
   get status() { return this._status; }

   //Setters
   set title(newTitle) {
      if (newTitle.trim() === '') {
         throw new Error("Invalid assignment title");
      }
      this._title = newTitle;
   }
   set description(newDescription) {
      if (newDescription.trim() === '') {
         throw new Error("Invalid assignment description");
      }
      this._description = newDescription;
   }
   set dueDate(newDueDate) {
      const date = new Date(newDueDate);
      if (isNaN(date.getTime())) {
         throw new Error("Invalid due date");
      }
      this._dueDate = date;
   }
   set minScore(newMinScore) {
      if (newMinScore < 0 || newMinScore > this._maxScore) {
         throw new Error(`Minimum score must be between 0 and ${this._maxScore}`);
      }
      this._minScore = newMinScore;
   }
   set maxScore(newMaxScore) {
      if (newMaxScore <= 0 || newMaxScore < this._minScore) {
         throw new Error("Maximum score must be greater than 0 and greater than minimum score");
      }
      this._maxScore = newMaxScore;
   }
   set type(newType) {
      const validTypes = ['assignment', 'quiz',];
      if (!validTypes.includes(newType)) {
         throw new Error("Invalid assignment type");
      }
      this._type = newType;
   }
   set status(newStatus) {
      const validStatus = ['active', 'closed', 'submitted', 'graded'];
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
   }//❌

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
   }//❌

   getAverageScore() {
      const gradedAssignment = Array.from(this._submissions.values())
         .filter(item => item.score !== null);

      if (gradedAssignment.length === 0) return 0;

      const totalScore = gradedAssignment.reduce((sum, sub) => sum + sub.score, 0);
      return totalScore / gradedAssignment.length;
   }//❌
}

export default Assignment;