import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, message, Select } from "antd";
import axios from "axios";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { functions } from "../firebase";
import { useAuth } from "./contexts/authContext/useAuth";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [sortOption, setSortOption] = useState("releaseDate-asc");
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

    const fetchPopularMovies = async () => {
      try {
        const { data } = await axios.get("https://api.themoviedb.org/3/movie/popular", {
          params: {
            api_key: "fbb2ad881df28e33842f45f5313e2b21", // Replace with your TMDB API key
          },
        });
        setPopularMovies(data.results.slice(0, 9)); // Limit to 3 popular movies
      } catch (error) {
        console.error("Error fetching popular movies: ", error);
        message.error("Failed to fetch popular movies.");
      }
    };

    fetchMovies();
    fetchPopularMovies();
  }, []);

  const sortedMovies = [...movies].sort((a, b) => {
    const [key, order] = sortOption.split("-");
    const direction = order === "asc" ? 1 : -1;
    return key === "releaseDate"
      ? direction * (new Date(a.releaseDate) - new Date(b.releaseDate))
      : direction * (a.duration - b.duration);
  });

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleAddMovieClick = () => {
    navigate("/movie/create");
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  return (
    <div className="p-6 min-h-96 bg-white rounded-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularMovies.map((movie) => (
            <Card
              key={movie.id}
              hoverable
              cover={
                <div className="h-64 overflow-hidden">
                  <img
                    alt={movie.title}
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              }
              onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, "_blank")} // Redirect to TMDB
            >
              <Card.Meta title={movie.title} description={movie.overview.slice(0, 100) + "..."} />
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Movies</h2>
        <Select
          defaultValue="releaseDate-asc"
          onChange={handleSortChange}
          style={{ width: 200 }}
        >
          <Select.Option value="releaseDate-asc">Release Date (Ascending)</Select.Option>
          <Select.Option value="releaseDate-desc">Release Date (Descending)</Select.Option>
          <Select.Option value="duration-asc">Duration (Ascending)</Select.Option>
          <Select.Option value="duration-desc">Duration (Descending)</Select.Option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMovies.map((movie) => (
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
