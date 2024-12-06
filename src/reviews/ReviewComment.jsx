import { Avatar, Button, message, Rate } from "antd";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";

export default function ReviewComment({ review, users, setFormReviewId }) {
  const { user } = useAuth();
  const deleteReview = async () => {
    try {
      const deleteReview = httpsCallable(functions, "reviews-deleteReview");
      await deleteReview({ reviewId: review.id });
      message.success("Review deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Error deleting review");
    }
  };

  const editReview = () => {
    setFormReviewId(review.id);
  };

  return (
    <div key={review.id} className="mb-4 p-4 border rounded-lg shadow-sm">
      <div className="flex items-center mb-2">
        <Avatar src={users[review.userId].photoUrl} />
        <span className="ml-2 font-semibold">
          {users[review.userId].username}
        </span>
      </div>
      <div className="mb-2">
        <h3 className="text-lg font-bold">{review.title}</h3>
        <p className="text-gray-700">{review.text}</p>
        <div className="mt-2">
          <Rate disabled value={review.rating} />
        </div>
      </div>
      {review.userId == user.uid && (
        <div className="flex gap-2">
          <Button type="primary" onClick={editReview}>
            Edit
          </Button>
          <Button danger onClick={deleteReview}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
