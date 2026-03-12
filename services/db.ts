import { collection, doc, DocumentData, CollectionReference, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, User, Cart, Order } from "@/types";

// Helper for strongly typed collection access
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

// Collections
export const collections = {
  products: createCollection<Product>("products"),
  users: createCollection<User>("users"),
  carts: createCollection<Cart>("carts"),
  orders: createCollection<Order>("orders"),
};

// Typed Docs
export const getProductDoc = (id: string) => doc(db, "products", id);
export const getUserDoc = (uid: string) => doc(db, "users", uid);
export const getCartDoc = (userId: string) => doc(db, "carts", userId);
export const getOrderDoc = (orderId: string) => doc(db, "orders", orderId);
