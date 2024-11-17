import { Card } from "antd";
import { useNavigate } from "react-router";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Button } from "antd";
import { useState } from "react";

export const movies = [
  {
    id: "1",
    image: "/assets/wolf.webp",
    title: "Wolf of Wall Street",
    description:
      "A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street.",
  },
  {
    id: "2",
    image: "/assets/james.webp",
    title: "Casino Royale",
    description:
      "James Bond's first mission as 007 leads him to Le Chiffre, banker to the world's terrorists.",
  },
  {
    id: "3",
    image: "/assets/gray.jfif",
    title: "50 Shades of Gray",
    description:
      "Literature student Anastasia Steele's life changes forever when she meets handsome, yet tormented, billionaire Christian Grey.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const handleMovieClick = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
                  src={movie.image}
                  className="w-full h-full object-cover"
                />
              </div>
            }
            onClick={() => handleMovieClick(movie.id)}
          >
            <Card.Meta title={movie.title} description={movie.description} />
          </Card>
        ))}

        <Card
          hoverable
          onClick={showModal}
          className="flex items-center justify-center"
        >
          <PlusOutlined style={{ fontSize: "48px" }} />
        </Card>
        <Modal
          title="Create a new movie"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>Movie creation form </p>
        </Modal>
      </div>
    </div>
  );
}
