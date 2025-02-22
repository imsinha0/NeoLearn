import { auth } from "@/firebase"; // Ensure auth is imported
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"; // Import necessary functions

async function signUp(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed up:", user);
        // Redirect to a protected page or update UI
    } catch (error: any) { // Specify error type
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign-up error:", errorCode, errorMessage);
        // Display an error message to the user
    }
}

async function signIn(email: string, password: string) { // Specify parameter types
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user);
        // Redirect to a protected page or update UI
    } catch (error: any) { // Specify error type
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Sign-in error:", errorCode, errorMessage);
        // Display an error message to the user
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

function signOut() {
    firebaseSignOut(auth).then(() => { // Use the renamed signOut function
        // Sign-out successful.
        console.log("User signed out");
        // Redirect to the login page or update UI accordingly
    }).catch((error: any) => { // Specify error type
        // An error happened.
        console.error("Sign-out error:", error);
    });
}


export { signUp, signIn, signOut }; // Export the functions