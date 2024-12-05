import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { useEffect } from "react";
import { auth } from "../firebase";

export default function Login() {
  useEffect(() => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    ui.start("#firebaseui-auth-container", {
      signInSuccessUrl: "/",
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        },
      ],
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div id="firebaseui-auth-container"></div>
    </div>
  );
}
