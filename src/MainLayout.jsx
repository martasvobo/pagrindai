import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { Badge, Button, Divider, Layout, Popover, Modal } from "antd";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { auth } from "../firebase";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false); // State for the logout confirmation modal

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleTitleClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const notifications = ["Notification 1", "Notification 2", "Notification 3"];

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
            onClick={() => setIsModalVisible(true)} // Show confirmation modal
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

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        visible={isModalVisible}
        onOk={async () => {
          setIsModalVisible(false);
          await handleLogout(); // Logout on confirmation
        }}
        onCancel={() => setIsModalVisible(false)} // Close modal on cancel
        okText="Yes, Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
