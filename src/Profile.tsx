import { Avatar, Card } from "antd";
import { UserOutlined } from "@ant-design/icons";

const Profile = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <div className="flex flex-col items-center mb-4">
        <Avatar size={150} icon={<UserOutlined />} className="mb-4" />
        <p>This is the profile page.</p>
      </div>
      <Card title="Statistics" className="w-full max-w-md mx-auto">
        <ul className="list-disc list-inside">
          <li>Movies Watched: 120</li>
          <li>Reviews Written: 45</li>
          <li>Favorites: 30</li>
        </ul>
      </Card>
    </div>
  );
};

export default Profile;
