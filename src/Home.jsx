import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, message, Select } from "antd";
import axios from "axios";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { functions } from "../firebase";
import { useAuth } from "./contexts/authContext/useAuth";

const RECOMMENDATION_OPTIONS = [
  { label: "By Duration", value: "duration" },
  { label: "By Release Date", value: "releaseDate" },
  { label: "By Popular Movies", value: "popular" },
];

const PLACEHOLDER_IMAGE = "/assets/placeholder.webp";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState(
    JSON.parse(localStorage.getItem("selectedRecommendations")) || ["popular"]
  );
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
        const { data } = await axios.get(
          "https://api.themoviedb.org/3/movie/popular",
          {
            params: {
              api_key: "fbb2ad881df28e33842f45f5313e2b21",
            },
          }
        );
        setPopularMovies(data.results);
      } catch (error) {
        console.error("Error fetching popular movies: ", error);
        message.error("Failed to fetch popular movies.");
      }
    };

    fetchMovies();
    fetchPopularMovies();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "selectedRecommendations",
      JSON.stringify(selectedRecommendations)
    );
    generateRecommendations();
  }, [selectedRecommendations, movies, popularMovies]);

  const sortedMovies = [...movies].sort((a, b) => {
    const [key, order] = sortOption.split("-");
    const direction = order === "asc" ? 1 : -1;
    return key === "releaseDate"
      ? direction * (new Date(a.releaseDate) - new Date(b.releaseDate))
      : direction * (a.duration - b.duration);
  });

  const generateRecommendations = () => {
    let newRecommendations = [];
    const filteredPopular = popularMovies.slice(6, 9);

    if (selectedRecommendations.includes("popular")) {
      newRecommendations = [...newRecommendations, ...filteredPopular];
    }

    if (selectedRecommendations.includes("duration")) {
      const byDuration = [...movies]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 3);
      newRecommendations = [...newRecommendations, ...byDuration];
    }

    if (selectedRecommendations.includes("releaseDate")) {
      const byReleaseDate = [...movies]
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .slice(0, 3);
      newRecommendations = [...newRecommendations, ...byReleaseDate];
    }

    setRecommendations(newRecommendations);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleAddMovieClick = () => {
    navigate("/movie/create");
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  const handleRecommendationChange = (checkedValues) => {
    setSelectedRecommendations(checkedValues);
  };

  return (
    <div className="p-6 min-h-96 bg-white rounded-lg">
      {/* Popular Movies Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularMovies.slice(0, 6).map((movie) => (
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
              onClick={() =>
                window.open(
                  `https://www.themoviedb.org/movie/${movie.id}`,
                  "_blank"
                )
              }
            >
              <Card.Meta
                title={movie.title}
                description={movie.overview.slice(0, 100) + "..."}
              />
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
        <Checkbox.Group
          options={RECOMMENDATION_OPTIONS}
          value={selectedRecommendations}
          onChange={handleRecommendationChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {recommendations.map((rec, index) => (
            <Card
              key={`${rec.id}-${index}`}
              hoverable
              cover={
                <div className="h-64 overflow-hidden">
                  <img
                    alt={rec.title || rec.original_title}
                    src={
                      rec.poster_path
                        ? `https://image.tmdb.org/t/p/w500/${rec.poster_path}`
                        : rec.image
                        ? rec.image
                        : PLACEHOLDER_IMAGE
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              }
              onClick={() =>
                rec.poster_path
                  ? window.open(
                      `https://www.themoviedb.org/movie/${rec.id}`,
                      "_blank"
                    )
                  : handleMovieClick(rec.id)
              }
            >
              <Card.Meta
                title={rec.title || rec.original_title}
                description={rec.description || rec.overview || ""}
              />
            </Card>
          ))}
        </div>
      </div>

      {/* All Movies Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Movies</h2>
        <Select
          defaultValue="releaseDate-asc"
          onChange={handleSortChange}
          style={{ width: 200 }}
        >
          <Select.Option value="releaseDate-asc">
            Release Date (Ascending)
          </Select.Option>
          <Select.Option value="releaseDate-desc">
            Release Date (Descending)
          </Select.Option>
          <Select.Option value="duration-asc">
            Duration (Ascending)
          </Select.Option>
          <Select.Option value="duration-desc">
            Duration (Descending)
          </Select.Option>
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
                  src={movie.image || PLACEHOLDER_IMAGE}
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
