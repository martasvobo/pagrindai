import { User } from "firebase/auth";
import { createContext } from "react";

export const AuthContext = createContext<{
  currentUser: User | null;
  userLoading: boolean;
}>({
  currentUser: null,
  userLoading: true,
});