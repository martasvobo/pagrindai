import React, { useState } from "react";
import { Avatar, Button, message } from "antd";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";
import CommentCensor from "./CommentCensor";

export default function CommentComment({ comment, users, setFormCommentId }) {
  const { user } = useAuth();
  const [isCensorModalVisible, setIsCensorModalVisible] = useState(false);

  const deleteComment = async () => {
    try {
      const deleteComment = httpsCallable(functions, "comments-deleteComment");
      await deleteComment({ commentId: comment.id });
      message.success("Comment deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Error deleting comment");
    }
  };

  const editComment = () => {
    setFormCommentId(comment.id);
  };

  const openCensorModal = () => {
    setIsCensorModalVisible(true);
  };

  const closeCensorModal = () => {
    setIsCensorModalVisible(false);
  };

  const handleCensorComplete = () => {
    message.success("Censorship completed.");
  };

  return (
    <div key={comment.id} className="mb-4 p-4 border rounded-lg shadow-sm">
      <div className="flex items-center mb-2">
        <Avatar src={users[comment.userId]?.photoUrl} />
        <span className="ml-2 font-semibold">
          {users[comment.userId]?.username || "Unknown User"}
        </span>
      </div>
      <div className="mb-2">
        <p className="text-gray-700">{comment.text}</p>
        {comment.censored && (
          <p className="text-red-500 text-sm">
            Censored
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {comment.userId === user.uid && (
          <>
            <Button type="primary" onClick={editComment}>
              Edit
            </Button>
            <Button danger onClick={deleteComment}>
              Delete
            </Button>
          </>
        )}
        {user.data.isAdmin && (
          <>
            <Button danger onClick={openCensorModal}>
              Censor
            </Button>
            <CommentCensor
              comment={comment}
              visible={isCensorModalVisible}
              onClose={closeCensorModal}
              onCensorComplete={handleCensorComplete}
            />
          </>
        )}
      </div>
    </div>
  );
}
