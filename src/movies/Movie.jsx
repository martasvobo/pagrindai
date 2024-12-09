import { Button, Rate, message } from "antd";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import CommentSection from "../comments/CommentSection";
import { useAuth } from "../contexts/authContext/useAuth";
import ReviewSection from "../reviews/ReviewSection";

export default function MovieDescription() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [actor, setActor] = useState(null);
  const [director, setDirector] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movieRating, setMovieRating] = useState(5);

  useEffect(() => {
    const fetchMovieRatings = async () => {
      try {
        const weightsRef = collection(db, "reviewWeights");
        const reviewsRef = collection(db, "reviews");
        const weightsSnapshot = await getDocs(weightsRef);
        const reviewsSnapshot = await getDocs(reviewsRef);
        const reviews = reviewsSnapshot.docs.filter(
          (doc) => doc.data().movieId === movieId
        );
        const weightedRatings = reviews.map((review) => {
          const weightDoc = weightsSnapshot.docs.find(
            (weight) => weight.id === review.id
          );
          return (
            review.data().rating * (weightDoc ? weightDoc.data().weight : 1)
          );
        });
        const averageRating =
          weightedRatings.reduce((acc, rating) => acc + rating, 0) /
          weightedRatings.length;
        setMovieRating(averageRating);
        console.log(averageRating);
      } catch (error) {
        console.error("Error fetching movie ratings: ", error);
        message.error("Failed to fetch movie ratings.");
      }
    };

    fetchMovieRatings();
  }, [movieId]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieRef = doc(db, "movies", movieId);
        const movieSnapshot = await getDoc(movieRef);
        if (!movieSnapshot.exists()) {
          message.error("Movie not found.");
          navigate("/");
          return;
        }
        const movieData = movieSnapshot.data();
        setMovie(movieData);

        if (movieData.actorId) {
          const actorRef = doc(db, "actors", movieData.actorId);
          const actorSnapshot = await getDoc(actorRef);
          if (actorSnapshot.exists()) {
            setActor(actorSnapshot.data());
          }
        }

        if (movieData.directorId) {
          const directorRef = doc(db, "directors", movieData.directorId);
          const directorSnapshot = await getDoc(directorRef);
          if (directorSnapshot.exists()) {
            setDirector(directorSnapshot.data());
          }
        }
      } catch (error) {
        console.error("Error fetching movie details: ", error);
        message.error("Failed to fetch movie details.");
      }
    };

    fetchMovieDetails();
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">{movie.title}</h1>
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        <div className="flex-shrink-0 mb-4 lg:mb-0">
          <img
            src={movie.image || "/assets/placeholder.png"}
            alt={movie.title}
            className="w-full lg:w-96 rounded-lg shadow-md object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-lg font-medium">
              <strong>Release Date:</strong> {movie.releaseDate}
            </p>
            <p className="text-lg font-medium">
              <strong>Duration:</strong> {movie.duration} minutes
            </p>
          </div>

          {actor && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Actor</h2>
              <p>
                <strong>Name:</strong> {actor.vardas} {actor.pavarde}
              </p>
              <p>
                <strong>Date of Birth:</strong> {actor.gimimoData}
              </p>
              <p>
                <strong>Specialization:</strong> {actor.specializacija}
              </p>
              <p>
                <strong>Awards:</strong> {actor.apdovanojimuKiekis}
              </p>
            </div>
          )}

          {director && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Director</h2>
              <p>
                <strong>Name:</strong> {director.vardas} {director.pavarde}
              </p>
              <p>
                <strong>Date of Birth:</strong> {director.gimimoData}
              </p>
              <p>
                <strong>Nationality:</strong> {director.tautybe}
              </p>
              <p>
                <strong>Biography:</strong> {director.biografijosAprasymas}
              </p>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{movie.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">User Ratings</h2>
            <Rate allowHalf defaultValue={5} value={movieRating} />
          </div>

          {user?.data?.isAdmin && (
            <div className="flex space-x-4">
              <Button
                type="primary"
                onClick={() => navigate(`/movie/edit/${movieId}`)}
              >
                Edit
              </Button>
              <Button danger onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <CommentSection movieId={movieId} />
      </div>
      <ReviewSection />
    </div>
  );
}
