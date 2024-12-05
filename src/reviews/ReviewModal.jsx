import { Button, Form, Input, Modal, Rate } from "antd";
import { httpsCallable } from "firebase/functions";
import React from "react";
import { functions } from "../../firebase";
import FormItem from "antd/es/form/FormItem";
import { useParams } from "react-router";
import { message } from "antd";
import { useForm } from "antd/es/form/Form";

export default function ReviewModal({ open, setOpen }) {
  const [form] = useForm();
  const { movieId } = useParams();
  const handleOk = () => {
    form.submit();
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const createReview = (fields) => {
    const addReview = httpsCallable(functions, "createReview");

    addReview({ ...fields, movieId })
      .then((result) => {
        message.success("Review added successfully");
        form.resetFields();
        setOpen(false);
      })
      .catch((error) => {
        message.error("Error adding review");
        console.error(error);
      });
  };

  return (
    <div>
      <Modal
        title="Submit a Review"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Submit
          </Button>,
        ]}
      >
        <Form layout="vertical" onFinish={createReview} form={form}>
          <FormItem label="Rating" name="rating">
            <Rate />
          </FormItem>
          <FormItem label="Title" name="title">
            <Input />
          </FormItem>
          <FormItem label="Text" name="text">
            <Input.TextArea rows={4} />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
}
