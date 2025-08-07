import Teacher from "../models/Teacher.js";

class TeacherController {
   constructor() {
      this._teachers = new Map();
   }

   getTeacherById(teacherId) { return this._teachers.get(teacherId); }
   getAllTeachers() { return Array.from(this._teachers.values()); }

   addTeacher(teacherData) {
      try {
         let teacher = new Teacher(
            teacherData.name,
            teacherData.email,
            teacherData.phone,
            teacherData.address,
            teacherData.birthDate,
            teacherData.department,
            teacherData.subjects,
            teacherData.assignedClasses,
         );

         this._teachers.set(teacher.id, teacher);
         // this._addNotification(`Teacher added: ${teacher.getDisplayInfo()}`);
         console.log(`\n\n✅ Teacher added: ${teacher.getDisplayInfo()}`);
         return teacher;

      } catch (error) {
         console.error(`❌ Failed to add teacher: ${error.message}`);
         throw error;
      }
   }

   updateTeacher(teacherId, updatedData) {
      const teacher = this.getTeacherById(teacherId);
      if (!teacher) {
         throw new Error(`Teacher with ID ${teacherId} not found`);
      }

      try {
         if (updatedData.name && updatedData.name.trim() !== '')
            teacher.name = updatedData.name;
         if (updatedData.email && updatedData.email.trim() !== '')
            teacher.email = updatedData.email;
         if (updatedData.phone && updatedData.phone.trim() !== '')
            teacher.phone = updatedData.phone;
         if (updatedData.address && updatedData.address.trim() !== '')
            teacher.address = updatedData.address;
         if (updatedData.birthDate && updatedData.birthDate.trim() !== '')
            teacher.birthDate = updatedData.birthDate;
         if (updatedData.department && updatedData.department.trim() !== '')
            teacher.department = updatedData.department;

         if (updatedData.subjects && updatedData.subjects.length > 0) {
            // Filter hanya subject baru yang belum ada
            const newSubjects = updatedData.subjects.filter(newSubj =>
               !teacher.subjects.some(existingSubj =>
                  existingSubj.toLowerCase() === newSubj.toLowerCase()
               )
            );

            if (newSubjects.length === 0) {
               console.log(`All subjects already exist for this teacher.`);
            } else {
               // Tambahkan hanya subject yang baru
               newSubjects.forEach(subject => {
                  teacher.addOrUpdateSubject(subject);
               });
               console.log(`✅ Added ${newSubjects.length} new subjects to teacher.`);
            }
         }

         if (updatedData.assignedClasses && updatedData.assignedClasses.length > 0)
            teacher.assignedClasses = updatedData.assignedClasses;

         console.log(`✅ Teacher updated: ${teacher.getDisplayInfo()}`);
      } catch (error) {
         console.error(`❌ Failed to update teacher: ${error.message}`);
      }
   }
}

export default TeacherController;