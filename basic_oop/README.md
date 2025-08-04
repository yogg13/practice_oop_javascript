# Praktik Object-Oriented Programming (OOP) dalam JavaScript

Pembelajaran ini mengimplementasikan konsep-konsep fundamental Object-Oriented Programming dalam JavaScript, meliputi:

- **Kelas dan Objek**
- **Pewarisan (Inheritance)**
- **Enkapsulasi (Encapsulation)**
- **Polimorfisme (Polymorphism)**


### Kelas Dasar: Animal

Kelas `Animal` berfungsi sebagai kelas induk dengan fitur-fitur berikut:

#### Properti:

- `#_name` - Field private (enkapsulasi menggunakan private fields)
- `_weight` - Properti protected (konvensi menggunakan underscore)
- `_color` - Properti protected

#### Method:

- `constructor(name, weight, color)` - Inisialisasi properti hewan
- `eat()` - Perilaku makan untuk hewan, yang akan ditimpa oleh kelas turunan
- `getName()` - Getter untuk field name yang private
- `getWeight()` - Getter untuk berat
- `setWeight(weight)` - Setter untuk berat
- `getColor()` - Getter untuk warna

### Kelas Turunan

#### Kelas Cat

Memperluas kelas Animal dengan perilaku spesifik kucing:

- Menimpa method `eat()` (polimorfisme)
- Menambahkan method `walk()` khusus untuk kucing

#### Kelas Eagle

Memperluas kelas Animal dengan perilaku spesifik elang:

- Menimpa method `eat()` (polimorfisme)
- Menambahkan method `fly()` khusus untuk elang

#### Kelas Fish

Memperluas kelas Animal dengan perilaku spesifik ikan:

- Menimpa method `eat()` (polimorfisme)
- Menambahkan method `swim()` khusus untuk ikan

## Konsep OOP yang Didemonstrasikan

### 1. Enkapsulasi (Encapsulation)

```javascript
class Animal {
	#_name = null; // Field private - tidak dapat diakses langsung dari luar
	_weight = 0; // Properti protected (konvensi)

	getName() {
		// Method public untuk mengakses field private
		return this.#_name;
	}
}
```

### 2. Pewarisan (Inheritance)

```javascript
class Cat extends Animal {
	constructor(name, weight, color) {
		super(name, weight, color); // Memanggil constructor parent
	}
}
```

### 3. Polimorfisme (Polymorphism)

Setiap kelas turunan menimpa method `eat()` dengan perilaku spesifik:

- Cat: "can eating a fish"
- Eagle: "can eating a meat"
- Fish: "can eating algae"

## Contoh Penggunaan

```javascript
// Membuat instance
let cat = new Cat("Tom", 5, "Gray");
let eagle = new Eagle("Eagle", 3, "Brown");
let fish = new Fish("Goldfish", 1, "Gold");

// Mendemonstrasikan polimorfisme
console.log(cat.eat()); // Tom can eating a fish
console.log(eagle.eat()); // Eagle can eating a meat
console.log(fish.eat()); // Goldfish can eating algae

// Mendemonstrasikan perilaku spesifik
console.log(cat.walk()); // Tom can walking
console.log(eagle.fly()); // Eagle can flying
console.log(fish.swim()); // Goldfish can swimming
```

## Poin-Poin Pembelajaran Utama

1. **Private Fields**: Menggunakan `#_name` untuk mendemonstrasikan enkapsulasi sesungguhnya dalam JavaScript modern
2. **Method Overriding**: Setiap jenis hewan memiliki perilaku makan yang berbeda
3. **Constructor Chaining**: Kelas turunan memanggil constructor parent menggunakan `super()`
4. **Behavioral Methods**: Setiap hewan memiliki kemampuan unik (berjalan, terbang, berenang)

## Output

Ketika Anda menjalankan kode, Anda akan melihat:

```
Tom can eating a fish
Tom can walking

Eagle can eating a meat
Eagle can flying

Goldfish can eating algae
Goldfish can swimming
```

Ini mendemonstrasikan bagaimana objek-objek yang berbeda dari kategori hewan yang sama dapat berperilaku berbeda sambil berbagi properti dan method yang sama.
