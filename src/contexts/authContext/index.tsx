import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser({ ...user });
    } else {
      setCurrentUser(null);
    }

    setUserLoading(false);
  }

  return (
    <AuthContext.Provider value={{ currentUser, userLoading }}>
      {!userLoading && children}
    </AuthContext.Provider>
  );
}
