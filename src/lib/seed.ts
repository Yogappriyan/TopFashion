import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SAMPLE_PRODUCTS = [
  {
    name: "Classic Midnight Tuxedo",
    description: "Expertly tailored slim-fit tuxedo in Italian wool. Features satin peak lapels and covered buttons. Perfect for black-tie events.",
    category: "Suits",
    price: 45000,
    originalPrice: 55000,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1594932224824-c451e59639f8?auto=format&fit=crop&q=80"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: true
  },
  {
    name: "Linen Summer Blazer",
    description: "Breathable linen blazer in desert sand. Unstructured for a modern, relaxed silhouette. Ideal for destination weddings.",
    category: "Blazers",
    price: 12500,
    originalPrice: 15000,
    stock: 25,
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80"],
    sizes: ["M", "L", "XL"],
    isFeatured: true
  },
  {
    name: "Silk Heritage Sherwani",
    description: "Exquisite hand-embroidered sherwani in ivory silk. Features traditional Zardosi work and velvet accents.",
    category: "Ethnic",
    price: 68000,
    originalPrice: 75000,
    stock: 5,
    images: ["https://images.unsplash.com/photo-1598808503746-f34c53b20ef3?auto=format&fit=crop&q=80"],
    sizes: ["M", "L"],
    isFeatured: true
  }
];

export async function seedCatalog() {
  const productsCol = collection(db, 'products');
  for (const product of SAMPLE_PRODUCTS) {
    await addDoc(productsCol, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}
