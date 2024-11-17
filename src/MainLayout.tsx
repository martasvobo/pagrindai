import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { Badge, Button, Divider, Layout, Popover } from "antd";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { auth } from "../firebase";
import { useAuth } from "./contexts/authContext/useAuth";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const { currentUser, userLoading } = useAuth();

  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate("/login");
    }
  }, [userLoading, currentUser, navigate]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const [notifications, setNotifications] = useState([
    "Notification 1",
    "Notification 2",
    "Notification 3",
  ]);

  const notificationContent = (
    <div>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <p key={index}>{notification}</p>
        ))
      ) : (
        <p>No new notifications</p>
      )}
    </div>
  );

  return (
    <Layout className="min-h-screen">
      <Header className="flex justify-between items-center bg-blue-500 p-4">
        <div
          className="text-white text-xl cursor-pointer"
          onClick={handleTitleClick}
        >
          Film Haven
        </div>
        <div>
          <Popover content={notificationContent} title="Notifications">
            <Badge count={notifications.length}>
              <BellOutlined
                style={{
                  fontSize: "24px",
                  color: "white",
                  marginRight: "16px",
                }}
              />
            </Badge>
          </Popover>
          <Divider type="vertical" />
          <Button
            type="default"
            danger={true}
            onClick={async () => {
              try {
                await auth.signOut();
                navigate("/login");
              } catch (error) {
                console.error("Error logging out: ", error);
              }
            }}
          >
            Logout
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            shape="circle"
            icon={<UserOutlined />}
            onClick={handleProfileClick}
          />
        </div>
      </Header>
      <Content className="flex-grow p-12">
        <Outlet />
      </Content>
      <Footer className="text-center">
        Film Haven ©{new Date().getFullYear()} Created by KTU studentai
      </Footer>
    </Layout>
  );
};

export default MainLayout;
