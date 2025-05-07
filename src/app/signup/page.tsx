import { Timestamp } from "firebase/firestore";

async function handleSignup(signupEmail: string, name: string, newURL: string | null) {
  // ... existing code ...

  await addData(`users/${updatedUser.uid}`, {
    email: signupEmail,
    photoURL: newURL || "",
    displayName: name,
    createdAt: Timestamp.fromDate(new Date())
  });

  // ... existing code ...
} 