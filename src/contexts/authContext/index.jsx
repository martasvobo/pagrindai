import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase"; // Make sure to import your Firestore instance
import { AuthContext } from "./authContext";
import { useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  console.log(user);
  useEffect(() => {
    return onAuthStateChanged(auth, initializeUser);
  }, []);

  async function initializeUser(user) {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser({ ...user, data: userDoc.data() });
      } else {
        console.log("No such document!");
        setUser({ ...user, data: null });
      }
    } else {
      setUser(null);
      navigate("/login");
    }

    setUserLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, userLoading }}>
      {!userLoading && children}
    </AuthContext.Provider>
  );
}
