export const STATIC_CATEGORIES = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: { en: "Burgers", ar: "برجر" },
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: { en: "Pizza", ar: "بيتزا" },
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: { en: "Drinks", ar: "مشروبات" },
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: { en: "Dessert", ar: "حلويات" },
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80"
  }
];

export const STATIC_PRODUCTS = [
  {
    id: "p1",
    name: { en: "Double Cheeseburger", ar: "دبل تشيز برجر" },
    description: { en: "Two beef patties, cheddar cheese, lettuce, tomato, and special sauce.", ar: "شريحتان من لحم البقر، جبنة شيدر، خس، طماطم، وصلصة خاصة." },
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    categoryId: "11111111-1111-1111-1111-111111111111",
    isAvailable: true
  },
  {
    id: "p2",
    name: { en: "Spicy Zinger Burger", ar: "زنجر برجر حار" },
    description: { en: "Crispy spicy chicken breast, lettuce, mayonnaise, and cheese.", ar: "صدر دجاج مقرمش حار، خس، مايونيز، وجبنة." },
    price: 8.49,
    imageUrl: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=400&q=80",
    categoryId: "11111111-1111-1111-1111-111111111111",
    isAvailable: true
  },
  {
    id: "p3",
    name: { en: "Pepperoni Pizza", ar: "بيتزا بيبيروني" },
    description: { en: "Tomato sauce, mozzarella cheese, and premium pepperoni.", ar: "صلصة طماطم، جبنة موزاريلا، وبيبيروني فاخر." },
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80",
    categoryId: "22222222-2222-2222-2222-222222222222",
    isAvailable: true
  },
  {
    id: "p4",
    name: { en: "Margherita Pizza", ar: "بيتزا مارغريتا" },
    description: { en: "Tomato sauce, fresh mozzarella, basil, and olive oil.", ar: "صلصة طماطم، موزاريلا طازجة، ريحان، وزيت زيتون." },
    price: 11.49,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80",
    categoryId: "22222222-2222-2222-2222-222222222222",
    isAvailable: true
  },
  {
    id: "p5",
    name: { en: "Coca Cola", ar: "كوكا كولا" },
    description: { en: "Chilled 330ml can.", ar: "علبة باردة سعة 330 مل." },
    price: 1.99,
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
    categoryId: "33333333-3333-3333-3333-333333333333",
    isAvailable: true
  },
  {
    id: "p6",
    name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" },
    description: { en: "Naturally squeezed fresh oranges.", ar: "عصير برتقال طازج معصور طبيعياً." },
    price: 3.49,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80",
    categoryId: "33333333-3333-3333-3333-333333333333",
    isAvailable: true
  },
  {
    id: "p7",
    name: { en: "Chocolate Fudge Cake", ar: "كعكة الشوكولاتة الداكنة" },
    description: { en: "Rich and moist chocolate cake layered with chocolate fudge frosting.", ar: "كعكة شوكولاتة غنية ورطبة مغطاة بصلصة الفدج اللذيذة." },
    price: 5.99,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
    categoryId: "44444444-4444-4444-4444-444444444444",
    isAvailable: true
  },
  {
    id: "p8",
    name: { en: "Strawberry Cheesecake", ar: "تشيز كيك الفراولة" },
    description: { en: "Creamy cheesecake on a graham cracker crust with strawberry topping.", ar: "تشيز كيك كريمي مع بسكويت غراهام وتوت الفراولة الطازج." },
    price: 6.49,
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80",
    categoryId: "44444444-4444-4444-4444-444444444444",
    isAvailable: true
  }
];

export const STATIC_ORDERS = [
  {
    id: "order-1001",
    customerName: "Assessor Tester",
    createdAt: new Date().toISOString(),
    totalAmount: 25.98,
    paymentMethod: "CashOnDelivery",
    deliveryAddress: "123 Cloud Deployment Boulevard",
    addressDetails: "Floor 4, Suite 402",
    phoneNumber: "+1234567890",
    notes: "Please ring the bell and leave the warm food on the table.",
    status: "Pending",
    items: [
      {
        productName: { en: "Pepperoni Pizza", ar: "بيتزا بيبيروني" },
        quantity: 2,
        unitPrice: 12.99
      }
    ]
  },
  {
    id: "order-1002",
    customerName: "Jane Smith",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    totalAmount: 18.48,
    paymentMethod: "CashOnDelivery",
    deliveryAddress: "456 Cozy Forest Street",
    addressDetails: "Villa 12",
    phoneNumber: "+1987654321",
    notes: "No onions in the zinger burger please.",
    status: "Preparing",
    items: [
      {
        productName: { en: "Spicy Zinger Burger", ar: "زنجر برجر حار" },
        quantity: 1,
        unitPrice: 8.49
      },
      {
        productName: { en: "Double Cheeseburger", ar: "دبل تشيز برجر" },
        quantity: 1,
        unitPrice: 9.99
      }
    ]
  }
];

