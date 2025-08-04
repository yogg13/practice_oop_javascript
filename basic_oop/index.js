class Animal {

   #_name = null;
   _weight = 0;
   _color = null;

   constructor(name, weight, color,) {
      this.#_name = name;
      this._weight = weight;
      this._color = color;
   }

   eat() {
      return "Any animal can eat";
   }

   getName() {
      return this.#_name;
   }

   getWeight() {
      return this._weight;
   }

   setWeight(weight) {
      this._weight = weight;
   }

   getColor() {
      return this._color;
   }

}

class Cat extends Animal {
   constructor(name, weight, color) {
      super(name, weight, color);
   }

   eat() {
      return `${this.getName()} can eating a fish`;
   }

   walk() {
      return `${this.getName()} can walking \n`;
   }
}

class Eagle extends Animal {
   constructor(name, weight, color) {
      super(name, weight, color);
   }

   eat() {
      return `${this.getName()} can eating a meat`;
   }

   fly() {
      return `${this.getName()} can flying \n`;
   }
}

class Fish extends Animal {
   constructor(name, weight, color) {
      super(name, weight, color);
   }

   eat() {
      return `${this.getName()} can eating algae`;
   }

   swim() {
      return `${this.getName()} can swimming \n`;
   }
}

let cat = new Cat("Tom", 5, "Gray");
let eagle = new Eagle("Eagle", 3, "Brown");
let fish = new Fish("Goldfish", 1, "Gold");

console.log(cat.eat());
console.log(cat.walk());

console.log(eagle.eat());
console.log(eagle.fly());

console.log(fish.eat());
console.log(fish.swim());