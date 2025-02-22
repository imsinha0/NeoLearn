import { auth } from "@/firebase"; // Ensure auth is imported
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"; // Import necessary functions
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { FirebaseError } from "firebase/app";

async function signUp(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return user;
    } catch (error: FirebaseError) {
        throw error;
    }
}

async function signIn(email: string, password: string, router: AppRouterInstance) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        router.push("/courses");
        return user;
    } catch (error: FirebaseError) {
        throw error;
    }
}

onAuthStateChanged(auth, (user: any) => { // Specify user type
    if (user) {
        // User is signed in, see the user's profile in the console
        console.log("User is signed in:", user);
        // Redirect to a protected page or update UI accordingly
    } else {
        // User is signed out
        console.log("User is signed out");
        // Redirect to the login page or update UI accordingly
    }
});

async function signOut() {
    await firebaseSignOut(auth);
}

export { signUp, signIn, signOut }; // Export the functions