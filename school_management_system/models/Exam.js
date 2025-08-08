class Exam {
   constructor(title, date, duration, minScore, maxScore, examType, courseId) {
      this._id = this._generateExamId();
      this._title = title;
      this._date = new Date(date);
      this._duration = duration; // in minutes
      this._maxScore = maxScore;
      this._minScore = minScore;
      this._examType = examType;
      this._courseId = courseId;
      this._results = new Map();
      this._createdAt = new Date();
      this._status = 'scheduled'; // scheduled, in_progress, completed, cancelled
   }

   // Getters
   get id() { return this._id; }
   get title() { return this._title; }
   get date() { return new Date(this._date); }
   get duration() { return this._duration; }
   get minScore() { return this._minScore; }
   get maxScore() { return this._maxScore; }
   get examType() { return this._examType; }
   get courseId() { return this._courseId; }
   get results() { return Array.from(this._results.values()); }
   get status() { return this._status; }

   // Setters
   set title(newTitle) {
      if (newTitle.trim() === '') {
         throw new Error("Invalid exam title");
      }
      this._title = newTitle;
   }
   set date(newDate) {
      const date = new Date(newDate);
      if (isNaN(date.getTime())) {
         throw new Error("Invalid exam date");
      }
      this._date = date;
   }
   set duration(newDuration) {
      if (newDuration <= 0) {
         throw new Error("Duration must be a positive number");
      }
      this._duration = newDuration;
   }
   set minScore(newMinScore) {
      if (newMinScore <= 0) {
         throw new Error("Minimum score must be a positive number");
      }
      this._minScore = newMinScore;
   }
   set maxScore(newMaxScore) {
      if (newMaxScore <= 0 || newMaxScore < this._minScore) {
         throw new Error("Maximum score must be a positive number and greater than minimum score");
      }
      this._maxScore = newMaxScore;
   }
   set examType(newExamType) {
      const validTypes = ['exam', 'midterm', 'final'];
      if (!validTypes.includes(newExamType)) {
         throw new Error("Invalid exam type");
      }
      this._examType = newExamType;
   }
   set status(newStatus) {
      const validStatus = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatus.includes(newStatus)) {
         throw new Error("Invalid Exam Status");
      }
      this._status = newStatus;
   }

   _generateExamId() {
      return `EXM-${Math.random().toString(36).substring(2, 9)}`;
   }

   recordResult(studentId, score, startTime, endTime) {
      if (this._status !== 'in_progress' && this._status !== 'completed') {
         throw new Error("Can't record result for this exam status");
      }
      if (score < 0 || score > this._maxScore) {
         throw new Error(`Score must be between 0 and ${this._maxScore}`);
      }

      const result = {
         studentId: studentId,
         score: score,
         startTime: new Date(startTime),
         endTime: new Date(endTime),
         duration: Math.floor((new Date(endTime) - new Date(startTime)) / (1000 * 60)), // in minutes
      }
      this._results.set(studentId, result);
      return result;
   }

   /*
   getAverageScore() {
      if (this._results.size === 0) return 0;

      const totalScore = Array.from(this._results.values())
         .reduce((sum, result) => sum + result.score, 0);

      return totalScore / this._results.size;
   }
   */

   /*

   getPassingRate(passingScore = this._maxScore * 0.6) {
      if (this._results.size === 0) return 0;

      const passedCount = Array.from(this._results.values())
         .filter(result => result.score >= passingScore).length;

      return (passedCount / this._results.size) * 100;
   }
   */


   getExamStats() {
      const scores = Array.from(this._results.values()).map(result => result.score);

      if (scores.length === 0) {
         return {
            totalParticipants: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            passingRate: 0
         };
      }

      return {
         totalParticipants: scores.length,
         averageScore: this.getAverageScore(),
         highestScore: Math.max(...scores),
         lowestScore: Math.min(...scores),
         passingRate: this.getPassingRate()
      };
   }
}

export default Exam;