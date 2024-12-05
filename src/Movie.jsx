import { Comment } from "@ant-design/compatible";
import { Avatar, Button, Card, Rate } from "antd";
import { useState } from "react";
import { useParams } from "react-router";
import ReviewModal from "./reviews/ReviewModal";
import ReviewSection from "./reviews/ReviewSection";

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
const MovieDescription = () => {
  const CommentActions = () => (
    <div>
      <Button type="link">Remove</Button>
      <Button type="link">Edit</Button>
      <Button type="link">Censor</Button>
    </div>
  );

  const { movieId } = useParams();
  const movie = movies.find((movie) => movie.id === movieId);

  if (!movie) {
    return <p>Movie not found</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>
      <div className="flex justify-end mb-4">
        <Button type="primary" className="mr-2">
          Edit Description
        </Button>
        <Button danger={true}>Remove Movie</Button>
      </div>
      <Card
        cover={
          <img
            alt={movie.title}
            src={movie.image}
            className="h-auto max-h-96 object-contain"
          />
        }
        className="mb-4"
      >
        <p>{movie.description}</p>
      </Card>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">User Ratings</h2>
        <Rate allowHalf defaultValue={4.5} />
      </div>
      <div className="flex">
        {/* Comments Section */}
        <div className="w-1/2 pr-2">
          <h2 className="text-xl font-bold mb-2">User Comments</h2>
          <Button type="primary" className="mb-4">
            Add Comment
          </Button>
          <Comment
            author={<a>User1</a>}
            avatar={<Avatar src="https://via.placeholder.com/40" alt="User1" />}
            content={<p>Great movie! Highly recommend.</p>}
            actions={[<CommentActions key="actions1" />]}
          />
          <Comment
            author={<a>User2</a>}
            avatar={<Avatar src="https://via.placeholder.com/40" alt="User2" />}
            content={<p>Not bad, but could be better.</p>}
            actions={[<CommentActions key="actions2" />]}
          />
        </div>
        <ReviewSection />
      </div>
    </div>
  );
};

export default MovieDescription;
