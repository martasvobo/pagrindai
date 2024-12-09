import { Button, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase"; // Import your Firebase setup
import { useAuth } from "../contexts/authContext/useAuth";
import CommentModal from "./CommentModal";
import CommentComment from "./CommentComment";

export default function CommentSection({ movieId }) {
  const [comments, setComments] = useState([]);
  const [commentId, setFormCommentId] = useState(null);
  const [users, setUsers] = useState({});
  const [form] = useForm();

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
        onClick={() => setFormCommentId(-1)} 
      >
        Add Comment
      </Button>
      {comments.map((commentId) => (
        <CommentComment
          comment={commentId}
          users = {users}
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
