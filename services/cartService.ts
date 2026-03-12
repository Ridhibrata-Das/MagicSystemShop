import { getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { collections, getCartDoc } from "./db";
import { Cart, CartItem } from "@/types";

export const getCart = async (userId: string): Promise<Cart | null> => {
  try {
    const snap = await getDoc(getCartDoc(userId));
    if (snap.exists()) {
      return snap.data() as Cart;
    }
    return null;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
};

export const syncCart = async (userId: string, items: CartItem[]): Promise<void> => {
  try {
    const docRef = getCartDoc(userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { items });
    } else {
      await setDoc(docRef, { userId, items });
    }
  } catch (error) {
    console.error("Error syncing cart:", error);
  }
};

export const clearCart = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(getCartDoc(userId));
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};
