import { Button, Form, Input, message, Select } from "antd";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";

export default function EditMovie() {
  const { movieId } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actors, setActors] = useState([]);
  const [directors, setDirectors] = useState([]);

  if (!user?.data?.isAdmin) {
    return <p>You are not authorized to access this page.</p>;
  }

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const actorSnapshot = await getDocs(collection(db, "actors"));
        const directorSnapshot = await getDocs(collection(db, "directors"));

        setActors(actorSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setDirectors(directorSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        message.error("Failed to load actors and directors.");
        console.error(error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieRef = doc(db, "movies", movieId);
        const movieSnapshot = await getDoc(movieRef);
        if (movieSnapshot.exists()) {
          form.setFieldsValue(movieSnapshot.data());
        } else {
          message.error("Movie not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching movie: ", error);
        message.error("Failed to fetch movie.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId, form, navigate]);

  const handleSubmit = async (values) => {
    try {
      const movieRef = doc(db, "movies", movieId);
      await updateDoc(movieRef, values);
      message.success("Movie updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating movie: ", error);
      message.error("Failed to update movie.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Movie</h1>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter a movie title" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Release Date"
          name="releaseDate"
          rules={[{ required: true, message: "Please enter a release date" }]}
        >
          <Input type="date" />
        </Form.Item>
        <Form.Item
          label="Duration (minutes)"
          name="duration"
          rules={[{ required: true, message: "Please enter the movie duration" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label="Actor"
          name="actor"
          rules={[{ required: true, message: "Please select an actor" }]}
        >
          <Select
            placeholder="Select an actor"
            options={actors.map((actor) => ({
              value: actor.id,
              label: `${actor.vardas} ${actor.pavarde}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Director"
          name="director"
          rules={[{ required: true, message: "Please select a director" }]}
        >
          <Select
            placeholder="Select a director"
            options={directors.map((director) => ({
              value: director.id,
              label: `${director.vardas} ${director.pavarde}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Image URL"
          name="image"
          rules={[
            { required: true, message: "Please enter the image URL" },
            { type: "url", message: "Please enter a valid URL" },
          ]}
        >
          <Input placeholder="https://example.com/image.jpg" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </Form>
    </div>
  );
}
