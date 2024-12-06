import { Button } from "antd";
import { useForm } from "antd/es/form/Form";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase";
import ReviewComment from "./ReviewComment";
import ReviewModal from "./ReviewModal";

export default function ReviewSection() {
  const [formReviewId, setFormReviewId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState({});
  const { movieId } = useParams();
  const [form] = useForm();

  useEffect(() => {
    const q = query(collection(db, "reviews"), where("movieId", "==", movieId));

    return onSnapshot(q, (querySnapshot) => {
      const reviewsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setReviews(reviewsData);
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
    <div className="w-1/2 pl-2">
      <h2 className="text-xl font-bold mb-2">User Reviews</h2>
      <Button
        type="primary"
        className="mb-4"
        onClick={() => setFormReviewId(-1)}
      >
        Add Review
      </Button>
      {reviews.map((review) => (
        <ReviewComment
          review={review}
          key={review.id}
          users={users}
          setFormReviewId={setFormReviewId}
        />
      ))}
      <ReviewModal
        reviews={reviews}
        formReviewId={formReviewId}
        setFormReviewId={setFormReviewId}
        form={form}
      />
    </div>
  );
}
