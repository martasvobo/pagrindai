import React, { useState } from "react";
import { Modal, Button, Form, Input, List, Checkbox, message } from "antd";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";



export default function CommentCensor({
  comment,
  visible,
  onClose,
  onCensorComplete,
}) {
  const [selectedWords, setSelectedWords] = useState([]);
  const [coefficient, setCoefficient] = useState(1);

  const handleWordSelect = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = async () => {
    if (selectedWords.length === 0) {
      return message.error("Please select words to censor.");
    }

    try {
      const censorCommentFn = httpsCallable(functions, "comments-censorComment");
      const result = await censorCommentFn({
        commentId: comment.id,
        selectedWords,
        coefficient,
      });
      if (result.data.status === "success") {
        message.success("Comment censored successfully!");
        onCensorComplete();
        onClose();
      } else {
        message.error(result.data.error);
      }
    } catch (error) {
      console.error(error);
      message.error("Error censoring comment.");
    }
  };
  const deleteComment = async () => {
    try {
      const deleteCommentFn = httpsCallable(functions, "comments-deleteComment");
      const result = await deleteCommentFn({ commentId: comment.id });
      if (result.data.status === "success") {
        message.success("Comment deleted successfully!");
        onCensorComplete();
        onClose();
      } else {
        message.error(result.data.error);
      }
    } catch (error) {
      console.error(error);
      message.error("Error deleting comment.");
    }
  };

  return (
    <Modal
      title="Censor Comment"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="delete" danger onClick={deleteComment}>
          Delete
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Censor
        </Button>,
      ]}
    >
      <div>
        <p>
          <strong>Comment Text:</strong> {comment.text}
        </p>
        <Form layout="vertical">
          <Form.Item label="Select Words to Censor">
            <List
              bordered
              dataSource={comment.text.split(" ")}
              renderItem={(word) => (
                <List.Item>
                  <Checkbox
                    checked={selectedWords.includes(word)}
                    onChange={() => handleWordSelect(word)}
                  >
                    {word}
                  </Checkbox>
                </List.Item>
              )}
            />
          </Form.Item>
          <Form.Item label="Censorship Coefficient">
            <Input
              type="number"
              value={coefficient}
              onChange={(e) => setCoefficient(Number(e.target.value))}
              placeholder="Enter coefficient"
              min={1}
              max={10}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
