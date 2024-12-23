const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const db = admin.firestore();

exports.getReviews = onCall({ region: "europe-west1" }, async (request) => {
  const { movieId } = request.data;

  try {
    const snapshot = await db
      .collection("reviews")
      .where("movieId", "==", movieId)
      .get();

    const reviews = [];
    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return { status: "success", reviews };
  } catch (error) {
    logger.error("Error getting reviews: ", error);
    return { status: "error", error: error.message };
  }
});

exports.createReview = onCall({ region: "europe-west1" }, async (request) => {
  try {
    logger.info("Create review: ", request);

    const reviewData = request.data;
    const userId = request.auth.uid;

    const existingReview = await db
      .collection("reviews")
      .where("userId", "==", userId)
      .where("movieId", "==", reviewData.movieId)
      .get();

    if (!existingReview.empty) {
      return {
        status: "error",
        error: "You already have a review for this movie",
      };
    }

    reviewData.rating = Math.min(5, Math.max(1, reviewData.rating));
    reviewData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    reviewData.modifiedAt = admin.firestore.FieldValue.serverTimestamp();
    reviewData.userId = userId;

    const review = await db.collection("reviews").add(reviewData);
    const reviewWeightData = {
      reviewId: review.id,
      weight: 1,
      penalties: 0,
      validated: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("reviewWeights").doc(review.id).set(reviewWeightData);

    return { status: "success" };
  } catch (error) {
    logger.error("Error creating review: ", error);
    return { status: "error", error: error.message };
  }
});

exports.updateReview = onCall({ region: "europe-west1" }, async (request) => {
  const { reviewId, reviewData } = request.data;
  const userId = request.auth.uid;
  reviewData.rating = Math.min(5, Math.max(1, reviewData.rating));

  try {
    const reviewRef = db.collection("reviews").doc(reviewId);
    const review = await reviewRef.get();

    if (!review.exists) {
      return { status: "error", error: "Review not found" };
    }

    if (review.data().userId !== userId) {
      return { status: "error", error: "Unauthorized" };
    }

    reviewData.modifiedAt = admin.firestore.FieldValue.serverTimestamp();
    await reviewRef.update(reviewData);

    return { status: "success" };
  } catch (error) {
    logger.error("Error updating review: ", error);
    return { status: "error", error: error.message };
  }
});

exports.deleteReview = onCall({ region: "europe-west1" }, async (request) => {
  const { reviewId } = request.data;
  const userId = request.auth.uid;

  try {
    const reviewRef = db.collection("reviews").doc(reviewId);
    const review = await reviewRef.get();

    if (!review.exists) {
      return { status: "error", error: "Review not found" };
    }

    if (review.data().userId !== userId) {
      return { status: "error", error: "Unauthorized" };
    }

    await reviewRef.delete();

    const reviewWeightRef = db.collection("reviewWeights").doc(reviewId);
    await reviewWeightRef.delete();

    return { status: "success" };
  } catch (error) {
    logger.error("Error deleting review: ", error);
    return { status: "error", error: error.message };
  }
});

exports.weightReview = onCall({ region: "europe-west1" }, async (request) => {
  try {
    const userId = request.auth.uid;

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return { status: "error", error: "Unauthorized: Admin access required" };
    }

    const { reviewId } = request.data;

    const reviewRef = db.collection("reviews").doc(reviewId);
    const review = await reviewRef.get();
    const reviewText = review.data().text;

    let weight = Math.min(reviewText.length / 50, 1);
    let penalties = 0;
    if (weight < 1) {
      penalties++;
    }

    const sentences = reviewText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    if (sentences.length === 1) {
      weight *= 0.9;
      penalties++;
    }

    const improperSentences = sentences.filter(
      (s) => s.trim() && !s.trim()[0].match(/[A-Z]/)
    );
    if (improperSentences.length > 0) {
      weight *= 0.9;
      penalties++;
    }

    const words = reviewText.split(/\s+/);
    const avgWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / words.length;
    if (avgWordLength < 4) {
      weight *= 0.9;
      penalties++;
    }

    const userReviews = await db
      .collection("reviews")
      .where("userId", "==", userId)
      .get();

    if (userReviews.size >= 3) {
      const ratings = [];
      userReviews.forEach((doc) => ratings.push(doc.data().rating));

      const avg = ratings.reduce((a, b) => a + b) / ratings.length;
      const variance =
        ratings.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / ratings.length;

      const varianceFactor = Math.min(variance / 2, 0.2);
      weight = weight * (0.8 + varianceFactor);
      if (varianceFactor < 0.2) {
        penalties++;
      }
    }

    weight = Math.max(0, Math.min(1, weight));

    await db.collection("reviewWeights").doc(reviewId).update({
      weight: weight,
      penalties: penalties,
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      validated: true,
    });

    await db.collection("reviews").doc(reviewId).update({
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      validated: true,
    });

    return { status: "success", weight, penalties };
  } catch (error) {
    logger.error("Error weighting review: ", error);
    return { status: "error", error: error.message };
  }
});
