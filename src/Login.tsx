import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { app } from "../firebase";

export default function Login() {
  useEffect(() => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(getAuth(app));

    ui.start("#firebaseui-auth-container", {
      signInSuccessUrl: "/",
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          clientId:
            "128928211189-lg7k8gqkfmt1puf4i9p4pmjcsjobe0mf.apps.googleusercontent.com",
        },
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        },
      ],
      //credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div id="firebaseui-auth-container"></div>
    </div>
  );
}
