import { Avatar, Button, message } from "antd";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";

export default function CommentComment({ comment, users, setFormCommentId }) {
  const { user } = useAuth();

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

  const censorComment = async () => {
    try {
      const censorComment = httpsCallable(functions, "comments-censorComment");
      const result = await censorComment({ commentId: comment.id });
      if (result.data.status === "error") {
        message.error(result.data.error);
        return;
      }
      message.success("Comment censored successfully");
    } catch (error) {
      console.error(error);
      message.error("Error censoring comment");
    }
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
            Censored: {comment.censorshipReason || "No reason provided"}
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
        {user.data.isAdmin && !comment.censored && (
          <Button danger onClick={censorComment}>
            Censor
          </Button>
        )}
      </div>
    </div>
  );
}
