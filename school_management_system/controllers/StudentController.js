import Student from "../models/Student.js";

class StudentController {
   constructor() {
      this._students = new Map();
   }

   //Getter
   getAllStudents() { return Array.from(this._students.values()); }
   getStudentById(studentId) { return this._students.get(studentId); }

   addStudent(studentData) {
      try {
         let student = new Student(
            studentData.name,
            studentData.email,
            studentData.phone,
            studentData.address,
            studentData.birthDate,
            studentData.gradeLevel,
            studentData.parentContact
         );
         this._students.set(student.id, student);
         console.log(`✅ Student added: ${student.getDisplayInfo()}`);
      } catch (error) {
         console.error(`❌ Failed to add student: ${error.message}`);
         throw error;
      }
   }

   updateStudent(studentId, updatedData) {
      const student = this.getStudentById(studentId);
      if (!student) {
         throw new Error(`Student with ID ${studentId} not found`);
      }
      try {
         // Gunakan setter dari Student class untuk update data
         if (updatedData.name && updatedData.name.trim() !== '')
            student.name = updatedData.name;

         if (updatedData.email && updatedData.email.trim() !== '')
            student.email = updatedData.email;

         if (updatedData.phone && updatedData.phone.trim() !== '')
            student.phone = updatedData.phone;

         if (updatedData.address && updatedData.address.trim() !== '')
            student.address = updatedData.address;

         if (updatedData.birthDate && updatedData.birthDate.trim() !== '')
            student.birthDate = updatedData.birthDate;

         if (updatedData.gradeLevel && updatedData.gradeLevel.trim() !== '')
            student.gradeLevel = updatedData.gradeLevel;

         // Update parent contact if provided
         if (updatedData.parentContact) {
            const parentContact = {};

            if (updatedData.parentContact.name && updatedData.parentContact.name.trim() !== '')
               parentContact.name = updatedData.parentContact.name;
            else
               parentContact.name = student.parentContact.name;

            if (updatedData.parentContact.phone && updatedData.parentContact.phone.trim() !== '')
               parentContact.phone = updatedData.parentContact.phone;
            else
               parentContact.phone = student.parentContact.phone;

            student.parentContact = parentContact;
         }

         console.log(`✅ Student updated: ${student}`);
      } catch (error) {
         console.error(`❌ Failed to update student: ${error.message}`);
         throw error;
      }
   }
}

export default StudentController;