const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const db = admin.firestore();

exports.getComments = onCall({ region: "europe-west1" }, async (request) => {
  const { movieId } = request.data;

  if (!movieId) {
    return { status: "error", error: "Movie ID is required." };
  }

  try {
    const snapshot = await db
      .collection("comments")
      .where("movieId", "==", movieId)
      .get();

    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { status: "success", comments };
  } catch (error) {
    logger.error("Error getting comments: ", error);
    return { status: "error", error: error.message };
  }
});

exports.createComment = onCall({ region: "europe-west1" }, async (request) => {
  const { text, movieId } = request.data;

  if (!request.auth) {
    return { status: "error", error: "User must be authenticated" };
  }

  const userId = request.auth.uid;

  if (!text || !movieId) {
    return { status: "error", error: "Text and movie ID are required." };
  }

  try {
    // Censorship check
    const snapshot = await db.collection("censorshipWords").get();
    const censoredWords = snapshot.docs.map((doc) => doc.data().word);

    const foundWords = censoredWords.filter((word) => text.includes(word));
    const isCensored = foundWords.length > 0;

    if (isCensored) {
      return {
        status: "error",
        error: `Comment contains prohibited words: ${foundWords.join(", ")}.`,
      };
    }

    const commentData = {
      text,
      movieId,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      editedAt: admin.firestore.FieldValue.serverTimestamp(),
      edited: false,
      censored: false,
    };

    const commentRef = await db.collection("comments").add(commentData);

    return { status: "success", commentId: commentRef.id };
  } catch (error) {
    logger.error("Error creating comment: ", error);
    return { status: "error", error: error.message };
  }
});

exports.updateComment = onCall({ region: "europe-west1" }, async (request) => {
  const { commentId, text } = request.data;

  if (!request.auth) {
    return { status: "error", error: "User must be authenticated." };
  }

  const userId = request.auth.uid;

  if (!text || !commentId) {
    return { status: "error", error: "Text and comment ID are required." };
  }

  try {
    const commentRef = db.collection("comments").doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      return { status: "error", error: "Comment not found." };
    }

    if (comment.data().userId !== userId) {
      return { status: "error", error: "Unauthorized." };
    }

    // Censorship check
    const snapshot = await db.collection("censorshipWords").get();
    const censoredWords = snapshot.docs.map((doc) => doc.data().word);

    const foundWords = censoredWords.filter((word) => text.includes(word));
    const isCensored = foundWords.length > 0;

    if (isCensored) {
      return {
        status: "error",
        error: `Comment contains prohibited words: ${foundWords.join(", ")}.`,
      };
    }

    await commentRef.update({
      text,
      edited: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: "success" };
  } catch (error) {
    logger.error("Error updating comment: ", error);
    return { status: "error", error: error.message };
  }
});


exports.deleteComment = onCall({ region: "europe-west1" }, async (request) => {
  const { commentId } = request.data;

  if (!request.auth) {
    return { status: "error", error: "User must be authenticated." };
  }

  const userId = request.auth.uid;

  if (!commentId) {
    return { status: "error", error: "Comment ID is required." };
  }

  try {
    const commentRef = db.collection("comments").doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      return { status: "error", error: "Comment not found." };
    }

    const isAdmin = request.auth.token.admin;
    const isOwner = comment.data().userId === userId;

    if (!isAdmin && !isOwner) {
      return { status: "error", error: "Unauthorized." };
    }

    await commentRef.delete();

    return { status: "success" };
  } catch (error) {
    logger.error("Error deleting comment: ", error);
    return { status: "error", error: error.message };
  }
});

exports.censorComment = onCall({ region: "europe-west1" }, async (request) => {
  const { commentId, reason, selectedWords, coefficient } = request.data;
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
    const censorshipWordsRef = db.collection("censorshipWords");

    for (let word of selectedWords) {
      const existingWord = await censorshipWordsRef.where("word", "==", word).get();

      if (existingWord.empty) {
        // If the word doesn't exist, add it to the censorshipWords collection
        await censorshipWordsRef.add({
          word: word,
          coefficient: coefficient,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    // Replace the selected words in the comment
    const censoredText = comment.data().text.replace(
      new RegExp(selectedWords.join("|"), "gi"),
      "****"
    );

    await commentRef.update({
      censored: true,
      censoredAt: admin.firestore.FieldValue.serverTimestamp(),
      text: censoredText,
    });

    return { status: "success" };
  } catch (error) {
    logger.error("Error censoring comment: ", error);
    return { status: "error", error: error.message };
  }
});

