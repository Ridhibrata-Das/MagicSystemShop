import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { collections, getUserDoc } from "./db";
import { setDoc, getDoc, updateDoc } from "firebase/firestore";
import { LoginFormValues, SignupFormValues } from "@/schemas/authSchemas";
import { User as UserProfile } from "@/types";

// Listen to auth state
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  // Ensure persistence is set
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => auth.currentUser;

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userSnap = await getDoc(getUserDoc(uid));
    if (!userSnap.exists()) return null;
    return { ...userSnap.data(), uid } as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const INITIAL_FUNDS = 1000;

export const signup = async (data: SignupFormValues) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Update auth profile
    await updateProfile(user, { displayName: data.name });

    // Store in Firestore
    await setDoc(getUserDoc(user.uid), {
      uid: user.uid,
      email: data.email,
      displayName: data.name,
      createdAt: Date.now(),
      credits: INITIAL_FUNDS,
      onboarded: false,
    });

    return { user, error: null };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { user: null, error: error.message };
  }
};

export const login = async (data: LoginFormValues) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { user: null, error: "Invalid email or password" };
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Store in Firestore if they are a new user
    const userDocRef = getUserDoc(user.uid);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "GUEST_ENTITY",
        createdAt: Date.now(),
        credits: INITIAL_FUNDS,
        onboarded: false,
      });
    }

    return { user, error: null };
  } catch (error: any) {
    console.error("Google Login error:", error);
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const refillCredits = async (uid: string, amount: number) => {
  try {
    const userRef = getUserDoc(uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("User not found");
    
    const current = snap.data().credits || 0;
    await updateDoc(userRef, { credits: current + amount });
    return { error: null };
  } catch (error: any) {
    console.error("Refill error:", error);
    return { error: error.message };
  }
};
