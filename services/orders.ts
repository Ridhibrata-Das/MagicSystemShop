import { getDocs, query, where, orderBy, runTransaction, doc, collection } from "firebase/firestore";
import { collections } from "./db";
import { db } from "@/lib/firebase";
import { Order } from "@/types";

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collections.orders,
      where("userId", "==", userId),
      // To use orderBy with where, we'd need a composite index in Firestore.
      // We will sort client-side or use descending order if a single index exists.
      // For now, let's just fetch and sort locally to avoid index creation errors.
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ ...doc.data(), orderId: doc.id } as Order));
    
    // Sort descending by createdAt
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

export const createOrder = async (
  userId: string,
  items: { productId: string; quantity: number; priceSnapshot: number }[],
  shippingAddress: any,
  totalPrice: number,
  paymentMethod: string = "gold"
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    const orderRef = doc(collection(db, "orders"));
    
    await runTransaction(db, async (transaction) => {
      // 1. Read all product docs and user doc
      const userRef = doc(db, "users", userId);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("Entity registry not found.");

      const productRefs = items.map(item => doc(db, "products", item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
      
      // 2. Verify funds
      const currentCredits = userDoc.data()?.credits || 0;
      if (paymentMethod === "gold" && currentCredits < totalPrice) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // 3. Verify stock
      productDocs.forEach((pDoc, index) => {
        if (!pDoc.exists()) throw new Error(`Product ${items[index].productId} not found.`);
        const currentStock = pDoc.data()?.stock || 0;
        if (currentStock < items[index].quantity) {
          throw new Error(`Insufficient stock for product ${pDoc.data()?.title || 'Unknown'}.`);
        }
      });
      
      // 4. Update balance and stock
      if (paymentMethod === "gold") {
        transaction.update(userRef, { credits: currentCredits - totalPrice });
      }
      
      productDocs.forEach((pDoc, index) => {
        const newStock = (pDoc.data()?.stock || 0) - items[index].quantity;
        transaction.update(pDoc.ref, { stock: newStock });
      });
      
      // 5. Create Order
      const newOrder = {
        orderId: orderRef.id,
        userId,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod,
        status: "confirmed",
        createdAt: Date.now(),
      };
      
      transaction.set(orderRef, newOrder);
    });

    return { success: true, orderId: orderRef.id };
  } catch (error: any) {
    if (error?.message === "INSUFFICIENT_FUNDS") {
      // Graceful handling for a known business logic state
      return { success: false, error: "INSUFFICIENT_FUNDS" };
    }
    
    console.error("Transaction failed:", error);
    return { success: false, error: error?.message || String(error) };
  }
};
