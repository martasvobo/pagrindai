const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");

admin.initializeApp();
const db = admin.firestore();

exports.reviews = require("./reviews");
exports.movies = require("./movies");

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const userDoc = {
      birthday: admin.firestore.Timestamp.fromDate(new Date()),
      city: "Kaunas",
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      name: "Dede",
      surname: "Jonas",
      username: "knaiseris",
      status: "girtas",
      isAdmin: false,
      photoUrl:
        "https://miro.medium.com/v2/resize:fit:500/1*6Ukzy9YDn1FYRDjG-1_FIA@2x.jpeg",
    };

    await db.collection("users").doc(user.uid).set(userDoc);
    logger.info("User created: ", user.uid);
  } catch (error) {
    logger.error("Error creating user: ", error);
  }
});
