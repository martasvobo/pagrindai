const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const db = admin.firestore();

exports.getComments = onCall({ region: "europe-west1" }, async (request) => {
  const { movieId } = request.data;

  try {
    const snapshot = await db
      .collection("comments")
      .where("movieId", "==", movieId)
      .get();

    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });

    return { status: "success", comments };
  } catch (error) {
    logger.error("Error getting comments: ", error);
    return { status: "error", error: error.message };
  }
});

exports.createComment = onCall({ region: "europe-west1" }, async (request) => {
  try {
    logger.info("Create comment: ", request);

    const { text, movieId } = request.data;
    const userId = request.auth.uid;

    if (!text || !movieId) {
      return { status: "error", error: "Text and movie ID are required" };
    }

    const commentData = {
      text,
      movieId,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      edited: false,
      censored: false,
    };

    await db.collection("comments").add(commentData);

    return { status: "success" };
  } catch (error) {
    logger.error("Error creating comment: ", error);
    return { status: "error", error: error.message };
  }
});

exports.updateComment = onCall({ region: "europe-west1" }, async (request) => {
  const { commentId, text } = request.data;
  const userId = request.auth.uid;

  if (!text || !commentId) {
    return { status: "error", error: "Text and comment ID are required" };
  }

  try {
    const commentRef = db.collection("comments").doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      return { status: "error", error: "Comment not found" };
    }

    if (comment.data().userId !== userId) {
      return { status: "error", error: "Unauthorized" };
    }

    await commentRef.update({
      text,
      edited: true,
    });

    return { status: "success" };
  } catch (error) {
    logger.error("Error updating comment: ", error);
    return { status: "error", error: error.message };
  }
});

exports.deleteComment = onCall({ region: "europe-west1" }, async (request) => {
  const { commentId } = request.data;
  const userId = request.auth.uid;

  if (!commentId) {
    return { status: "error", error: "Comment ID is required" };
  }

  try {
    const commentRef = db.collection("comments").doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      return { status: "error", error: "Comment not found" };
    }

    if (comment.data().userId !== userId) {
      return { status: "error", error: "Unauthorized" };
    }

    await commentRef.delete();

    return { status: "success" };
  } catch (error) {
    logger.error("Error deleting comment: ", error);
    return { status: "error", error: error.message };
  }
});

exports.censorComment = onCall({ region: "europe-west1" }, async (request) => {
  const { commentId, reason } = request.data;
  const userId = request.auth.uid;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return { status: "error", error: "Unauthorized: Admin access required" };
    }

    const commentRef = db.collection("comments").doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      return { status: "error", error: "Comment not found" };
    }

    await commentRef.update({
      censored: true,
      censorshipReason: reason || "No reason provided",
    });

    return { status: "success" };
  } catch (error) {
    logger.error("Error censoring comment: ", error);
    return { status: "error", error: error.message };
  }
});
