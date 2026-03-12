export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: number;
  credits: number;
  onboarded?: boolean;
  age?: number;
  profession?: string;
  skills?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: number;
}
