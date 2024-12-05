import { useParams } from "react-router";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Avatar, Button, Rate } from "antd";
import ReviewModal from "./ReviewModal";

export default function ReviewSection() {
  const [formOpen, setFormOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState({});
  const { movieId } = useParams();
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
      <Button type="primary" className="mb-4" onClick={() => setFormOpen(true)}>
        Add Review
      </Button>
      {reviews.map((review) => (
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
          <div className="flex gap-2">
            <Button type="primary">Edit</Button>
            <Button danger>Delete</Button>
          </div>
        </div>
      ))}
      <ReviewModal open={formOpen} setOpen={setFormOpen} />
    </div>
  );
}
