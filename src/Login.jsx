import { useState, useEffect } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export default function Register() {
  const [message, setMessage] = useState(""); // Success or error messages
  const [loading, setLoading] = useState(false); // Loading state
  const auth = getAuth();

  useEffect(() => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig = {
      signInFlow: "popup", // Avoid redirect flow to suppress warnings
      signInOptions: [
        {
          provider: "password", // Email/Password authentication
          requireDisplayName: true,
        },
      ],
      signInSuccessUrl: "#",
      callbacks: {
        signInSuccessWithAuthResult: async (authResult) => {
          const user = authResult.user;
          if (user) {
            console.log("User signed in:", user.email);

            if (user.emailVerified) {
              // Redirect to home page if the user is verified
              console.log("User email verified. Redirecting to home page...");
              window.location.href = "/"; // Replace with your home page route
            } else {
              // If not verified, ask the user to verify their email
              setLoading(true); // Show loading spinner during email send
              try {
                await sendEmailVerification(user);

                // Store the success message in localStorage
                localStorage.setItem(
                  "registrationMessage",
                  "Please verify your email before logging in. Check your inbox for the verification email."
                );

                // Redirect to the login page
                window.location.href = "/login"; // Replace with your login page route

                // Sign out the user to block access until verification
                await auth.signOut();
              } catch (error) {
                if (error.code === "auth/too-many-requests") {
                  setMessage(
                    "Please confirm your email by clicking the link in the sent mail."
                  );
                } else {
                  setMessage(`Failed to send verification email: ${error.message}`);
                }
              } finally {
                setLoading(false); // Hide loading spinner
              }
            }
          }
          return false; // Prevent FirebaseUI's automatic redirect
        },
        uiShown: () => {
          console.log("FirebaseUI loaded");

          // Check if there's a message from localStorage
          const storedMessage = localStorage.getItem("registrationMessage");
          if (storedMessage) {
            setMessage(storedMessage); // Set the message to display it
            localStorage.removeItem("registrationMessage"); // Clear it after displaying
          }
        },
      },
    };

    ui.start("#firebaseui-auth-container", uiConfig);

    return () => {
      ui.reset(); // Cleanup FirebaseUI on unmount
    };
  }, [auth]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div id="firebaseui-auth-container" className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"></div>
      {message && (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          {message}
        </div>
      )}
      {loading && (
        <div className="mt-4">
          {/* <p className="text-gray-500">Sending verification email...</p> */}
          <div className="loader mt-2"></div>
        </div>
      )}
    </div>
  );
}
