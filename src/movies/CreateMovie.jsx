import { Button, Form, Input, message, Select } from "antd";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";

export default function CreateMovie() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actors, setActors] = useState([]);
  const [directors, setDirectors] = useState([]);

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

  const handleAddActor = async (actor) => {
    try {
      const newActorRef = await addDoc(collection(db, "actors"), actor);
      const newActor = { id: newActorRef.id, ...actor };
      setActors([...actors, newActor]);
      message.success("Actor added successfully!");
    } catch (error) {
      message.error("Failed to add actor.");
      console.error(error);
    }
  };

  const handleAddDirector = async (director) => {
    try {
      const newDirectorRef = await addDoc(collection(db, "directors"), director);
      const newDirector = { id: newDirectorRef.id, ...director };
      setDirectors([...directors, newDirector]);
      message.success("Director added successfully!");
    } catch (error) {
      message.error("Failed to add director.");
      console.error(error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const movieData = {
        ...values,
        actorId: values.actor,
        directorId: values.director,
      };

      await addDoc(collection(db, "movies"), movieData);
      message.success("Movie created successfully!");
      navigate("/");
    } catch (error) {
      message.error("Failed to create movie.");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Movie</h1>
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
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: 8 }}>
                  <Button
                    type="link"
                    onClick={() => {
                      const vardas = prompt("Enter actor's first name:");
                      const pavarde = prompt("Enter actor's last name:");
                      const gimimoData = prompt("Enter actor's birth date (YYYY-MM-DD):");
                      const specializacija = prompt("Enter actor's specialization:");
                      const apdovanojimuKiekis = parseInt(prompt("Enter number of awards:"), 10);

                      handleAddActor({ vardas, pavarde, gimimoData, specializacija, apdovanojimuKiekis });
                    }}
                  >
                    Add New Actor
                  </Button>
                </div>
              </>
            )}
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
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: 8 }}>
                  <Button
                    type="link"
                    onClick={() => {
                      const vardas = prompt("Enter director's first name:");
                      const pavarde = prompt("Enter director's last name:");
                      const gimimoData = prompt("Enter director's birth date (YYYY-MM-DD):");
                      const tautybe = prompt("Enter director's nationality:");
                      const biografijosAprasymas = prompt("Enter biography:");

                      handleAddDirector({ vardas, pavarde, gimimoData, tautybe, biografijosAprasymas });
                    }}
                  >
                    Add New Director
                  </Button>
                </div>
              </>
            )}
          />
        </Form.Item>
        <Form.Item
          label="Image URL"
          name="image"
          rules={[
            { required: true, message: "Please enter the image URL" },
            {
              type: "url",
              message: "Please enter a valid URL",
            },
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
          Create Movie
        </Button>
      </Form>
    </div>
  );
}
