import { Button, Form, Input, message } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext/useAuth";

export default function CreateMovie() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user?.data?.isAdmin) {
    return <p>You are not authorized to access this page.</p>;
  }

  const handleSubmit = async (values) => {
    try {
      await addDoc(collection(db, "movies"), values);
      message.success("Movie created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error adding movie:", error);
      message.error("Failed to create movie.");
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
