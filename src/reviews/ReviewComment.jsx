import { Comment } from "@ant-design/compatible";
import { Avatar } from "antd";

export default function ReviewComment() {
  return (
    <Comment
      author={<a>Reviewer2</a>}
      avatar={<Avatar src="https://via.placeholder.com/40" alt="Reviewer2" />}
      content={<p>The cinematography was stunning.</p>}
      actions={[
        <div>
          <Button type="link">Remove</Button>
          <Button type="link">Edit</Button>
        </div>,
      ]}
    />
  );
}
