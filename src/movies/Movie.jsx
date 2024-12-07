import { Button, Card, Rate, message } from "antd";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";

export default function MovieDescription() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieRef = doc(db, "movies", movieId);
        const movieSnapshot = await getDoc(movieRef);
        if (movieSnapshot.exists()) {
          setMovie({ id: movieSnapshot.id, ...movieSnapshot.data() });
        } else {
          message.error("Movie not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching movie: ", error);
        message.error("Failed to fetch movie.");
      }
    };

    fetchMovie();
  }, [movieId, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        const movieRef = doc(db, "movies", movieId);
        await deleteDoc(movieRef);
        message.success("Movie deleted successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error deleting movie: ", error);
        message.error("Failed to delete movie.");
      }
    }
  };

  if (!movie) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>
      <div className="flex justify-end mb-4">
        {user?.data?.isAdmin && (
          <>
            <Button
              type="primary"
              className="mr-2"
              onClick={() => navigate(`/movie/edit/${movie.id}`)}
            >
              Edit
            </Button>
            <Button danger onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
      <Card
        cover={
          <img
            alt={movie.title}
            src={movie.image || "/assets/placeholder.png"}
            className="h-auto max-h-96 object-contain"
          />
        }
        className="mb-4"
      >
        <p>{movie.description}</p>
      </Card>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">User Ratings</h2>
        <Rate allowHalf defaultValue={movie.rating || 4.5} />
      </div>
    </div>
  );
}
