import { useState } from "react";
import { Avatar, Card, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";

const Profile = () => {
  const [showFriends, setShowFriends] = useState(true);

  const handleFriendClick = () => {
    setShowFriends(false);
  };

  return (
    <div className="p-4">
      {showFriends && <h1 className="text-2xl font-bold mb-4">Profile Page</h1>}
      <div className="flex flex-col items-center mb-4">
        <Avatar size={150} icon={<UserOutlined />} className="mb-4" />
        <Button type="primary" className="mb-4">
          Upload Image
        </Button>
        <p>This is the profile page.</p>
      </div>
      <Card title="Statistics" className="w-full max-w-md mx-auto">
        <ul className="list-disc list-inside">
          <li>Movies Watched: 120</li>
          <li>Reviews Written: 45</li>
          <li>Favorites: 30</li>
        </ul>
      </Card>
      {showFriends && (
        <>
          <Card
            title="Current Friends"
            className="w-full max-w-md mx-auto my-4"
          >
            <ul className="list-disc list-inside">
              <li onClick={handleFriendClick} className="cursor-pointer">
                John Doe
              </li>
              <li onClick={handleFriendClick} className="cursor-pointer">
                Jane Smith
              </li>
              <li onClick={handleFriendClick} className="cursor-pointer">
                Bob Johnson
              </li>
            </ul>
          </Card>
          <Card
            title="Friend Recommendations"
            className="w-full max-w-md mx-auto"
          >
            <ul className="list-disc list-inside">
              <li>Emily Davis</li>
              <li>Michael Brown</li>
              <li>Sarah Wilson</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
};

export default Profile;
