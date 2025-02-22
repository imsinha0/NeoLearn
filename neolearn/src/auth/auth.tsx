import { auth } from "@/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User
} from "firebase/auth";
import type { AppRouterInstance } from 'next/navigation';

async function signUp(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return user;
    } catch (error: unknown) {
        throw error;
    }
}

async function signIn(email: string, password: string, router: AppRouterInstance) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        router.push("/courses");
        return user;
    } catch (error: unknown) {
        throw error;
    }
}

onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
        console.log("User is signed in:", user);
    } else {
        console.log("User is signed out");
    }
});

async function signOut() {
    await firebaseSignOut(auth);
}

export { signUp, signIn, signOut };