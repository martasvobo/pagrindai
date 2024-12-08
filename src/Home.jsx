import { PlusOutlined } from "@ant-design/icons";
import { Card, message } from "antd";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { functions } from "../firebase";
import { useAuth } from "./contexts/authContext/useAuth";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      const getMovies = httpsCallable(functions, "movies-getMovies");
      try {
        const response = await getMovies();
        if (response.data.status === "success") {
          setMovies(response.data.movies);
        } else {
          message.error(response.data.error || "Failed to load movies.");
        }
      } catch (error) {
        console.error("Error fetching movies: ", error);
        message.error("Failed to load movies. Please try again.");
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleAddMovieClick = () => {
    navigate("/movie/create");
  };

  return (
    <div className="p-6 min-h-96 bg-white rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <Card
            key={movie.id}
            hoverable
            cover={
              <div className="h-64 overflow-hidden">
                <img
                  alt={movie.title}
                  src={movie.image || "/assets/placeholder.webp"}
                  className="w-full h-full object-cover"
                />
              </div>
            }
            onClick={() => handleMovieClick(movie.id)}
          >
            <Card.Meta title={movie.title} description={movie.description} />
          </Card>
        ))}

        {user?.data?.isAdmin && (
          <Card
            hoverable
            onClick={handleAddMovieClick}
            className="flex items-center justify-center"
          >
            <PlusOutlined style={{ fontSize: "48px" }} />
          </Card>
        )}
      </div>
    </div>
  );
}
