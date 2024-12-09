import React, { useState, useEffect } from "react";
import { Button, message, Modal, Input, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../firebase"; // Firebase setup
import CommentModal from "./CommentModal";
import CommentComment from "./CommentComment";

export default function CommentSection({ movieId }) {
  const [comments, setComments] = useState([]);
  const [commentId, setFormCommentId] = useState(null); // For managing modal
  const [users, setUsers] = useState({});
  const [form] = useForm();


  // Fetch the comments for the movie
  useEffect(() => {
    const q = query(collection(db, "comments"), where("movieId", "==", movieId));
    return onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setComments(commentsData);
    });
  }, [movieId]);

  // Fetch users data
  useEffect(() => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (querySnapshot) => {
      const usersData = {};
      querySnapshot.docs.forEach((doc) => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Comments</h2>
      <Button
        type="primary"
        className="mb-4"
        onClick={() => setFormCommentId(-1)} // Trigger form for adding a new comment
      >
        Add Comment
      </Button>

      {comments.map((comment) => (
        <CommentComment
          comment={comment}
          key={comment.id}
          users={users}
          setFormCommentId={setFormCommentId}
        />
      ))}
      <CommentModal
        commentId={commentId}
        movieId={movieId}
        setFormCommentId={setFormCommentId}
        form={form}
        comments={comments}
      />
    </div>
  );
}
