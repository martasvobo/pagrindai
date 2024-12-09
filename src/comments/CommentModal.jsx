import { Button, Form, Input, message, Modal } from "antd";
import FormItem from "antd/es/form/FormItem";
import { httpsCallable } from "firebase/functions";
import React, { useEffect } from "react";
import { functions } from "../../firebase";

export default function CommentModal({ 
  commentId, 
  movieId, 
  setFormCommentId, 
  form, 
  comments 
}) {
  const handleOk = () => {
    form.submit();
    setFormCommentId(null);
  };

  const handleCancel = () => {
    setFormCommentId(null);
  };

  const createComment = (fields) => {
    const addComment = httpsCallable(functions, "comments-createComment");
  
    addComment({ ...fields, movieId })
      .then((result) => {
        if (result.data.status === "error") {
          message.error(result.data.error);
          return;
        }
        message.success("Comment added successfully!");
        form.resetFields();
        setFormCommentId(null);
      })
      .catch(() => {
        message.error("Failed to save comment.");
      });
  };

  useEffect(() => {
    if (commentId !== null) {
      form.resetFields();
      if (commentId !== -1)
      {
        const comment = comments.find((c) => c.id === commentId);
        form.setFieldsValue(comment);
      }
    }
  }, [commentId, comments, form]);

  return (
    <div>
      <Modal
        title={"Add Comment"}
        open={commentId !== null}
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
          onFinish={createComment}
          form={form} 
        >
          <FormItem
            label="Comment"
            name="text"
            rules={[{ required: true, message: "Please enter a comment." }]}
          >
            <Input.TextArea rows={4} />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
}
