import React from "react";
import { useParams } from "react-router";

const MovieDescription = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Movie Description Page</h1>
      <p>This is the description for movie with ID: {id}</p>
    </div>
  );
};

export default MovieDescription;
