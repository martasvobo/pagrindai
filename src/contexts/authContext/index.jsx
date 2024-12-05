import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { AuthContext } from "./authContext";
import { useNavigate } from "react-router";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, initializeUser);
  }, []);

  async function initializeUser(user) {
    console.log(user);
    if (user) {
      setUser({ ...user });
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
