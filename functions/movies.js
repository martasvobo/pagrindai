const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const db = admin.firestore();

exports.getMovies = onCall({ region: "europe-west1" }, async () => {
  try {
    const snapshot = await db.collection("movies").get();
    const movies = [];
    snapshot.forEach((doc) => {
      movies.push({ id: doc.id, ...doc.data() });
    });

    return { status: "success", movies };
  } catch (error) {
    logger.error("Error getting movies: ", error);
    return { status: "error", error: error.message };
  }
});

exports.createMovie = onCall({ region: "europe-west1" }, async (request) => {
  const { data } = request;
  const userId = request.auth?.uid;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return { status: "error", error: "Unauthorized: Admin access required" };
    }

    const movieData = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const movie = await db.collection("movies").add(movieData);

    return { status: "success", movieId: movie.id };
  } catch (error) {
    logger.error("Error creating movie: ", error);
    return { status: "error", error: error.message };
  }
});

exports.updateMovie = onCall({ region: "europe-west1" }, async (request) => {
  const { movieId, movieData } = request.data;
  const userId = request.auth?.uid;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return { status: "error", error: "Unauthorized: Admin access required" };
    }

    const movieRef = db.collection("movies").doc(movieId);
    const movie = await movieRef.get();

    if (!movie.exists) {
      return { status: "error", error: "Movie not found" };
    }

    movieData.modifiedAt = admin.firestore.FieldValue.serverTimestamp();
    await movieRef.update(movieData);

    return { status: "success" };
  } catch (error) {
    logger.error("Error updating movie: ", error);
    return { status: "error", error: error.message };
  }
});

exports.deleteMovie = onCall({ region: "europe-west1" }, async (request) => {
  const { movieId } = request.data;
  const userId = request.auth?.uid;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return { status: "error", error: "Unauthorized: Admin access required" };
    }

    const movieRef = db.collection("movies").doc(movieId);
    const movie = await movieRef.get();

    if (!movie.exists) {
      return { status: "error", error: "Movie not found" };
    }

    await movieRef.delete();

    return { status: "success" };
  } catch (error) {
    logger.error("Error deleting movie: ", error);
    return { status: "error", error: error.message };
  }
});
