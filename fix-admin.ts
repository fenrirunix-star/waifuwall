import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({ projectId: "waifuwall0" });

async function fix() {
  try {
    const user = await getAuth().getUserByEmail('mozelentreprise@gmail.com');
    await getAuth().updateUser(user.uid, { password: 'catale237' });
    console.log("SUCCESS: Password updated to catale237");
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      const user = await getAuth().createUser({ email: 'mozelentreprise@gmail.com', password: 'catale237', emailVerified: true });
      console.log("SUCCESS: User created with password catale237");
    } else {
      console.error("ERROR:", err);
    }
  }
}
fix();
