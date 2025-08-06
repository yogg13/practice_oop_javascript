class Person {
   constructor(name, email, phone, address, birthDate) {
      //Validated First
      this._validateInput(name, email, phone);

      //Properties
      this._id = this._generateId();
      this._name = name;
      this._email = email;
      this._phone = phone;
      this._address = address;
      this._birthDate = new Date(birthDate);
      this._createdAt = new Date();
      this._updatedAt = new Date();
      this._role = 'Person';
   }

   _generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2)
   }

   _validateInput(name, email, phone) {
      if (!name || name.trim().length < 2) {
         throw new Error("Name must be at least 2 characters");
      }

      const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !checkEmail.test(email)) {
         throw new Error("Invalid email format");
      }

      if (!phone || phone.length !== 12) {
         throw new Error("Phone number must be exactly 12 digits");
      }
   }

   //Getter for Public
   get id() { return this._id; }
   get name() { return this._name; }
   get email() { return this._email; }
   get phone() { return this._phone; }
   get address() { return this._address; }
   get role() { return this._role; }
   get birthDate() { return new Date(this._birthDate); }
   get createdAt() { return new Date(this._createdAt); }
   get updatedAt() { return new Date(this._updatedAt); }
   get age() {
      const today = new Date();
      let age = today.getFullYear() - this._birthDate.getFullYear();

      return age;
   }

   _updateTimestamp() {
      this._updatedAt = new Date();
   }

   //Setter with validation
   set name(paramName) {
      if (!paramName || paramName.trim().length < 2) {
         throw new Error("Name must be at least 2 characters");
      }
      this._name = paramName.trim();
      this._updateTimestamp();
   }

   set email(paramEmail) {
      const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!paramEmail || !checkEmail.test(paramEmail)) {
         throw new Error("Invalid email format");
      }
      this._email = paramEmail;
      this._updateTimestamp();
   }

   set phone(paramPhone) {
      if (!paramPhone || paramPhone.length < 13) {
         throw new Error("Phone number must be at least 13 digits");
      }
      this._phone = paramPhone;
      this._updateTimestamp();
   }

   set address(paramAddress) {
      this._address = paramAddress;
      this._updateTimestamp();
   }

   //Base method can override
   getDisplayInfo() {
      return `${this._name} (${this._role}) `;
   }

   getContactInfo() {
      return {
         email: this._email,
         phone: this._phone,
         address: this._address,
      }
   }

   getFullProfile() {
      return {
         id: this._id,
         name: this._name,
         email: this._email,
         phone: this._phone,
         address: this._address,
         age: this.age,
         role: this._role,
         displayInfo: this.getDisplayInfo(),
         createdAt: this._createdAt,
         updatedAt: this._updatedAt
      }
   }
}

export default Person;