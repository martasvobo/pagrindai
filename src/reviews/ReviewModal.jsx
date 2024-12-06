import { Button, Form, Input, message, Modal, Rate } from "antd";
import FormItem from "antd/es/form/FormItem";
import { httpsCallable } from "firebase/functions";
import React, { useEffect } from "react";
import { useParams } from "react-router";
import { functions } from "../../firebase";

export default function ReviewModal({
  formReviewId,
  setFormReviewId,
  form,
  reviews,
}) {
  const { movieId } = useParams();
  const handleOk = () => {
    form.submit();
    setFormReviewId(null);
  };

  const handleCancel = () => {
    setFormReviewId(null);
  };

  const createReview = (fields) => {
    const addReview = httpsCallable(functions, "createReview");

    addReview({ ...fields, movieId })
      .then((result) => {
        if (result.data.status === "error") {
          message.error(result.data.error);
          return;
        }
        message.success("Review added successfully");
        form.resetFields();
        setFormReviewId(null);
      })
      .catch((error) => {
        message.error("Error adding review");
        console.error(error);
      });
  };

  const updateReview = (fields) => {
    const updateReview = httpsCallable(functions, "updateReview");

    updateReview({ reviewId: form.getFieldValue("id"), reviewData: fields })
      .then((result) => {
        if (result.data.status === "error") {
          message.error(result.data.error);
          return;
        }
        message.success("Review updated successfully");
        form.resetFields();
        setFormReviewId(null);
      })
      .catch((error) => {
        message.error("Error updating review");
        console.error(error);
      });
  };

  useEffect(() => {
    if (formReviewId !== null) {
      form.resetFields();
      if (formReviewId !== -1) {
        const review = reviews.find((r) => r.id === formReviewId);
        form.setFieldsValue(review);
      }
    }
  }, [formReviewId]);

  return (
    <div>
      <Modal
        title="Submit a Review"
        open={formReviewId !== null}
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
        <Form
          layout="vertical"
          onFinish={formReviewId === -1 ? createReview : updateReview}
          form={form}
        >
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
